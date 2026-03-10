import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import UploadPDF from './pages/UploadPDF';
import Dashboard from './pages/Dashboard';
import PDFViewerPage from './pages/PDFViewerPage';
import SolutionPage from './pages/SolutionPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)] transition-colors duration-300">
        <Header />
        <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadPDF />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pdf/:id" element={<PDFViewerPage />} />
            <Route path="/solution/:id" element={<SolutionPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
