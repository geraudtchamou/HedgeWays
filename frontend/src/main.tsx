import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import Dashboard from './pages/Dashboard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<div className="p-6"><h1 className="text-2xl font-bold">Products Page</h1></div>} />
          <Route path="portfolio" element={<div className="p-6"><h1 className="text-2xl font-bold">Portfolio Page</h1></div>} />
          <Route path="tokens" element={<div className="p-6"><h1 className="text-2xl font-bold">Tokens Page</h1></div>} />
          <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics Page</h1></div>} />
          <Route path="fees" element={<div className="p-6"><h1 className="text-2xl font-bold">Fees Page</h1></div>} />
          <Route path="compliance" element={<div className="p-6"><h1 className="text-2xl font-bold">Compliance Page</h1></div>} />
          <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings Page</h1></div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
