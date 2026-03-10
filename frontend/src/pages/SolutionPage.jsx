import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function SolutionPage() {
    const { id } = useParams();
    const [solution, setSolution] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSolution = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/solutions/${id}`);
                setSolution(res.data);
            } catch (error) {
                console.error('Error fetching solution:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSolution();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-xl">Loading Solution...</div>;
    if (!solution) return <div className="p-8 text-center text-xl text-red-500">Solution not found</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Link to={`/pdf/${solution.pdfId._id}`} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-6 inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to PDF: {solution.pdfId.originalName}
            </Link>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white">
                    <div className="flex gap-3 mb-4 flex-wrap">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">Page {solution.pageNumber}</span>
                        {solution.timeComplexity && <span className="bg-black/20 px-3 py-1 rounded-full text-sm font-mono backdrop-blur-sm">Time: {solution.timeComplexity}</span>}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{solution.title}</h1>
                    <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-2xl">{solution.approach}</p>
                </div>

                <div className="p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                            Explanation
                        </h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {solution.explanation}
                        </div>
                    </section>

                    {solution.codeSnippet && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                </span>
                                Code Snippet
                            </h2>
                            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto shadow-inner">
                                <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
                                    <code>{solution.codeSnippet}</code>
                                </pre>
                            </div>
                        </section>
                    )}

                    {solution.notes && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </span>
                                Additional Notes
                            </h2>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl text-gray-700 dark:text-gray-300 italic">
                                {solution.notes}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
