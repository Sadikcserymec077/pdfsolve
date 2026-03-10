import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Setting worker path to a CDN to avoid complex configuration in Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function BasicPDFViewer({ url, onCanvasClick, clickPos }) {
    const canvasRef = useRef(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [pageCount, setPageCount] = useState(0);

    useEffect(() => {
        let active = true;
        if (!url) return;

        const loadPDF = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                if (!active) return;
                setPdfDoc(pdf);
                setPageCount(pdf.numPages);
                setPageNum(1);
            } catch (error) {
                console.error('Error loading PDF:', error);
            }
        };
        loadPDF();

        return () => { active = false; };
    }, [url]);

    useEffect(() => {
        if (pdfDoc && canvasRef.current) {
            const renderPage = async () => {
                try {
                    const page = await pdfDoc.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = canvasRef.current;
                    const context = canvas.getContext('2d');

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    await page.render(renderContext).promise;
                } catch (error) {
                    console.error("Error rendering page:", error);
                }
            };
            renderPage();
        }
    }, [pdfDoc, pageNum]);

    const handleCanvasClick = (e) => {
        if (!canvasRef.current || !onCanvasClick) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage-based coordinates to be independent of scale
        const pctX = x / rect.width;
        const pctY = y / rect.height;

        onCanvasClick({ pctX, pctY, pageNum });
    };

    const goToPrevPage = () => {
        if (pageNum <= 1) return;
        setPageNum(prev => prev - 1);
    };

    const goToNextPage = () => {
        if (pageNum >= pageCount) return;
        setPageNum(prev => prev + 1);
    };

    if (!url) return <div className="p-4">Loading PDF...</div>;

    return (
        <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden h-full">
            <div className="bg-white dark:bg-gray-900 w-full p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
                <button onClick={goToPrevPage} disabled={pageNum <= 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50">Prev</button>
                <span className="text-sm font-medium">Page {pageNum} of {pageCount}</span>
                <button onClick={goToNextPage} disabled={pageNum >= pageCount} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50">Next</button>
            </div>
            <div className="flex-1 overflow-auto w-full flex justify-center p-4 bg-gray-100 dark:bg-gray-800 custom-scrollbar relative">
                <div className="relative inline-block max-w-full h-fit">
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className={`shadow-2xl rounded-sm max-w-full h-auto bg-white ${onCanvasClick ? 'cursor-crosshair' : ''}`}
                    />
                    {clickPos && clickPos.pageNum === pageNum && (
                        <div
                            className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-md z-20"
                            style={{
                                left: `${clickPos.pctX * 100}%`,
                                top: `${clickPos.pctY * 100}%`
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
