require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload dir exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Models
const PDFSchema = new mongoose.Schema({
    originalName: String,
    filepath: String,
    uploadDate: { type: Date, default: Date.now },
});
const PDF = mongoose.model('PDF', PDFSchema);

const SolutionSchema = new mongoose.Schema({
    pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF' },
    title: String,
    explanation: String,
    codeSnippet: String,
    approach: String,
    timeComplexity: String,
    notes: String,
    pageNumber: Number,
    pctX: Number,
    pctY: Number,
    createdAt: { type: Date, default: Date.now }
});
const Solution = mongoose.model('Solution', SolutionSchema);

// Multer Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Routes

// 1. Upload PDF
app.post('/api/pdf/upload', upload.single('pdf'), async (req, res) => {
    try {
        const newPdf = new PDF({
            originalName: req.file.originalname,
            filepath: req.file.path
        });
        await newPdf.save();
        res.json({ id: newPdf._id, message: 'Upload successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get PDF and its solutions
app.get('/api/pdf/:id', async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        const solutions = await Solution.find({ pdfId: req.params.id }).sort({ createdAt: -1 });
        res.json({ pdf, solutions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Add Solution
app.post('/api/pdf/:id/solutions', async (req, res) => {
    try {
        const sol = new Solution({
            pdfId: req.params.id,
            ...req.body
        });
        await sol.save();
        res.json({ message: 'Solution added successfully', sol });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Get a single solution for Solution Page
app.get('/api/solutions/:id', async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.id).populate('pdfId');
        res.json(solution);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Dashboard Summary
app.get('/api/dashboard', async (req, res) => {
    try {
        const pdfs = await PDF.find().sort({ uploadDate: -1 });
        const result = [];
        for (let pdf of pdfs) {
            const count = await Solution.countDocuments({ pdfId: pdf._id });
            result.push({ ...pdf._doc, solutionCount: count });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Generate Edited PDF
app.post('/api/pdf/:id/generate', async (req, res) => {
    try {
        const pdfRecord = await PDF.findById(req.params.id);
        const solutions = await Solution.find({ pdfId: req.params.id });

        if (!pdfRecord) return res.status(404).json({ error: 'PDF not found' });

        const pdfBytes = fs.readFileSync(path.join(__dirname, pdfRecord.filepath));
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Group solutions by page to calculate vertical offsets
        const pageOffsets = {};

        for (const sol of solutions) {
            const pageIndex = (sol.pageNumber || 1) - 1;

            if (pageIndex >= 0 && pageIndex < pages.length) {
                const page = pages[pageIndex];
                const { width, height } = page.getSize();

                let xPos = 50;
                let yPos = height - 50;

                // If coordinates are provided, use them. Note that PDF y=0 is at the bottom.
                if (sol.pctX !== undefined && sol.pctY !== undefined) {
                    xPos = sol.pctX * width;
                    // frontend pctY is from top to bottom, PDF y is from bottom to top
                    yPos = height - (sol.pctY * height);
                } else {
                    // Fallback to old vertical offset method
                    if (!pageOffsets[pageIndex]) pageOffsets[pageIndex] = height - 50;
                    yPos = pageOffsets[pageIndex];
                    pageOffsets[pageIndex] -= 25; // Move next link down
                }

                const text = `View Solution: ${sol.title}`;
                const solutionUrl = `${process.env.FRONTEND_URL}/solution/${sol._id}`;

                page.drawText(text, {
                    x: xPos,
                    y: yPos,
                    size: 14,
                    font,
                    color: rgb(0, 0, 1), // Blue
                });

                // Add hyperlink
                const linkAnnotation = pdfDoc.context.obj({
                    Type: 'Annot',
                    Subtype: 'Link',
                    Rect: [xPos, yPos - 5, xPos + 200, yPos + 15],
                    Border: [0, 0, 0],
                    C: [0, 0, 1], // Border color (if border is added)
                    A: {
                        Type: 'Action',
                        S: 'URI',
                        URI: solutionUrl,
                    },
                });

                if (!page.node.Annots) {
                    page.node.set(pdfDoc.context.obj('Annots'), pdfDoc.context.obj([]));
                }
                page.node.Annots().push(linkAnnotation);
            }
        }

        const modifiedPdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pdfRecord.originalName.replace('.pdf', '')}_solved.pdf"`);
        res.send(Buffer.from(modifiedPdfBytes));
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/pdf/:id/generate', async (req, res) => {
    // For simple GET download from dashboard
    try {
        const pdfRecord = await PDF.findById(req.params.id);
        const solutions = await Solution.find({ pdfId: req.params.id });

        if (!pdfRecord) return res.status(404).json({ error: 'PDF not found' });

        const pdfBytes = fs.readFileSync(path.join(__dirname, pdfRecord.filepath));
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const pageOffsets = {};

        for (const sol of solutions) {
            const pageIndex = (sol.pageNumber || 1) - 1;

            if (pageIndex >= 0 && pageIndex < pages.length) {
                const page = pages[pageIndex];
                const { width, height } = page.getSize();

                let xPos = 50;
                let yPos = height - 50;

                if (sol.pctX !== undefined && sol.pctY !== undefined) {
                    xPos = sol.pctX * width;
                    yPos = height - (sol.pctY * height);
                } else {
                    if (!pageOffsets[pageIndex]) pageOffsets[pageIndex] = height - 50;
                    yPos = pageOffsets[pageIndex];
                    pageOffsets[pageIndex] -= 25;
                }

                const text = `View Solution: ${sol.title}`;
                const solutionUrl = `${process.env.FRONTEND_URL}/solution/${sol._id}`;

                page.drawText(text, {
                    x: xPos,
                    y: yPos,
                    size: 14,
                    font,
                    color: rgb(0, 0, 1),
                });

                const linkAnnotation = pdfDoc.context.obj({
                    Type: 'Annot',
                    Subtype: 'Link',
                    Rect: [xPos, yPos - 5, xPos + 200, yPos + 15],
                    Border: [0, 0, 0],
                    A: {
                        Type: 'Action',
                        S: 'URI',
                        URI: solutionUrl,
                    },
                });

                if (!page.node.Annots) {
                    page.node.set(pdfDoc.context.obj('Annots'), pdfDoc.context.obj([]));
                }
                page.node.Annots().push(linkAnnotation);
            }
        }

        const modifiedPdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pdfRecord.originalName.replace('.pdf', '')}_solved.pdf"`);
        res.send(Buffer.from(modifiedPdfBytes));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
