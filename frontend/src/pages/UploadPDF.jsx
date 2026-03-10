import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function UploadPDF() {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/pdf/upload`, formData);
            // response.data should have the newly created PDF metadata ID
            navigate(`/pdf/${response.data.id}`);
        } catch (error) {
            console.error('Error uploading file:', error.response?.data || error);
            alert('Failed to upload PDF.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Upload your PDF</h2>
                    <p className="text-gray-500 dark:text-gray-400">Select or drop a PDF file here to begin adding solutions</p>
                </div>

                <div
                    className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group mb-6"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {file ? file.name : "Click to browse or drag file here"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF up to 10MB"}
                    </span>
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="application/pdf"
                        onChange={handleFileChange}
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                        </>
                    ) : (
                        'Upload & Continue'
                    )}
                </button>
            </div>
        </div>
    );
}
