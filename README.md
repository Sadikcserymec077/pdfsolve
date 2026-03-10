# PDFSolve

PDFSolve is a full-stack platform that allows users to upload study material PDFs, manually attach comprehensive solutions directly linked to specific pages, and generate a new edited PDF embedding those clickable solution links.

## Tech Stack
- **Frontend**: React, Tailwind CSS (v4), Vite, pdfjs-dist
- **Backend**: Node.js, Express, Multer, pdf-lib
- **Database**: MongoDB (Mongoose)

## Project Structure
- `frontend/` - Contains the React application.
- `backend/` - Contains the Express server.

## Getting Started

### 1. Start the Backend
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Make sure you have a local instance of MongoDB running. If you are using a cloud cluster or different port, update the `MONGODB_URI` inside `backend/.env`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server (dev mode):
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### 2. Start the Frontend
1. Open another terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The client will run on `http://localhost:5173`.*

## Features
- **PDF Upload:** Start by securely uploading a PDF file.
- **PDF Viewer:** Explore your file natively with our split-screen workspace.
- **Add Solutions Map:** Save code snippets, approach, time complexity, explanations, and map them to targeted pages.
- **Solution Page:** Access complete dedicated web pages corresponding to each complex problem.
- **Dynamic PDF Editing:** Generate a refined, solved copy of your PDF perfectly hyperlinked directly into its interactive counterpart online.
