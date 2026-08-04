import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Admin from './Admin.jsx'
import Success from './Success.jsx'
import TicketDetail from './TicketDetail.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/success" element={<Success />} />
        <Route path="/ticket/:id" element={<TicketDetail />} />
        {/* Catch-all route for 404 pages */}
        <Route path="*" element={<div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
            <p className="text-gray-600 mb-6">Page not found</p>
            <a href="/" className="bg-[#004C9C] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition">
              Back to Home
            </a>
          </div>
        </div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)