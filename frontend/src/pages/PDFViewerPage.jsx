import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import BasicPDFViewer from '../components/BasicPDFViewer';

export default function PDFViewerPage() {
    const { id } = useParams();
    const [pdfData, setPdfData] = useState(null);
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [clickPos, setClickPos] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        explanation: '',
        codeSnippet: '',
        approach: '',
        timeComplexity: '',
        notes: '',
        pageNumber: 1,
        pctX: '',
        pctY: '',
    });

    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchPDFDetails();
    }, [id]);

    const fetchPDFDetails = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/pdf/${id}`);
            setPdfData(res.data.pdf);
            setSolutions(res.data.solutions);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching PDF:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCanvasClick = (posData) => {
        if (!showForm) {
            setShowForm(true);
        }
        setClickPos(posData);
        setFormData(prev => ({
            ...prev,
            pageNumber: posData.pageNum,
            pctX: posData.pctX,
            pctY: posData.pctY
        }));
    };

    const handleAddSolution = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/pdf/${id}/solutions`, formData);
            setShowForm(false);
            setClickPos(null);
            setFormData({
                title: '', explanation: '', codeSnippet: '', approach: '', timeComplexity: '', notes: '', pageNumber: 1, pctX: '', pctY: ''
            });
            fetchPDFDetails(); // Refresh list
        } catch (error) {
            console.error('Error adding solution:', error);
            alert('Failed to add solution');
        }
    };

    const handleGeneratePDF = async () => {
        setGenerating(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/pdf/${id}/generate`, {}, { responseType: 'blob' });
            // Download the new PDF
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${pdfData.originalName.replace('.pdf', '')}_solved.pdf`;
            link.click();
        } catch (error) {
            console.error('Error generating edited PDF:', error);
            alert('Failed to generate PDF');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;
    if (!pdfData) return <div className="p-8 text-center text-xl text-red-500">PDF not found</div>;

    const pdfUrl = `${API_BASE_URL}/${pdfData.filepath}`;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-5rem)] pb-4 overflow-hidden">
            {/* Left Pane: PDF Viewer */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
                    <h2 className="font-bold text-lg truncate pr-4">{pdfData.originalName}</h2>
                    <div className="flex gap-2">
                        {showForm && !clickPos && (
                            <div className="animate-pulse flex items-center bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-3 py-1 rounded-md text-sm font-semibold border border-indigo-200 dark:border-indigo-800">
                                👈 Click anywhere on the PDF to place the link
                            </div>
                        )}
                        <button
                            onClick={handleGeneratePDF}
                            disabled={generating}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            {generating ? 'Generating...' : 'Download Solved PDF'}
                            {!generating && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                        </button>
                    </div>
                </div>
                <div className="flex-1 relative bg-gray-200 dark:bg-black/20 overflow-hidden h-full">
                    <BasicPDFViewer
                        url={pdfUrl}
                        onCanvasClick={showForm ? handleCanvasClick : undefined}
                        clickPos={clickPos}
                    />
                </div>
            </div>

            {/* Right Pane: Solutions Panel */}
            <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full">
                {showForm ? (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Solution</h3>
                            <button onClick={() => { setShowForm(false); setClickPos(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddSolution} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Problem Title</label>
                                <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Two Sum" />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium">Link Position</label>
                                    {clickPos ? (
                                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded font-mono">Set</span>
                                    ) : (
                                        <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded font-mono">Not Set</span>
                                    )}
                                </div>
                                {clickPos ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                        Page: {clickPos.pageNum} | X: {(clickPos.pctX * 100).toFixed(1)}% | Y: {(clickPos.pctY * 100).toFixed(1)}%
                                    </p>
                                ) : (
                                    <p className="text-xs text-indigo-500 font-medium animate-pulse">
                                        Click anywhere on the PDF viewer to place the link.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Approach (Brief)</label>
                                <input required name="approach" value={formData.approach} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" placeholder="Hash Map" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Explanation</label>
                                <textarea required name="explanation" value={formData.explanation} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" placeholder="Detailed explanation..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Time Complexity</label>
                                <input name="timeComplexity" value={formData.timeComplexity} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" placeholder="O(n)" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Code Snippet</label>
                                <textarea name="codeSnippet" value={formData.codeSnippet} onChange={handleInputChange} rows="4" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono text-sm focus:ring-2 focus:ring-indigo-500" placeholder="function solve() {...}"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                <input name="notes" value={formData.notes} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" placeholder="Edge cases observed..." />
                            </div>
                            <button type="submit" disabled={!clickPos} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-xl mt-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900 transition-transform active:scale-95">
                                {clickPos ? 'Save Solution' : 'Click on PDF to continue'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 transition-colors flex justify-center items-center gap-2 shadow-sm shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add New Solution
                        </button>

                        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
                            {solutions.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">
                                    <p>No solutions added yet.</p>
                                </div>
                            ) : (
                                solutions.map((sol, idx) => (
                                    <div key={sol._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{sol.title}</h4>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">Page {sol.pageNumber}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{sol.explanation}</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-mono text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded">{sol.timeComplexity || 'N/A'}</span>
                                            <a href={`/solution/${sol._id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center gap-1">
                                                View Full
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
