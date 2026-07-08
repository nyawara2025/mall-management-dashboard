// src/agri-main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PublicAgricHub } from './components/PublicAgricHub';
import './index.css';

// Extract the shop_id from the browser launch URL string
const urlParams = new URLSearchParams(window.location.search);
const shopIdParam = urlParams.get('shop_id');

// Save it straight to the storage slot PublicAgricHub is already configured to read
if (shopIdParam) {
  localStorage.setItem('farmmate_shop_id_isolated', shopIdParam);
}

const activeShopId = localStorage.getItem('farmmate_shop_id_isolated');
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  if (activeShopId) {
    // Explicitly seed the exact fallback key your component is expecting internally
    localStorage.setItem('remembered_shop_id', activeShopId);
    root.render(
      <React.StrictMode>
        <PublicAgricHub /> 
      </React.StrictMode>
    );
  } else {
    root.render(
      <div className="flex h-screen items-center justify-center font-sans">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600">Invalid Link</h1>
          <p className="text-gray-600 mt-2">Please use the official link provided by your Institution.</p>
        </div>
      </div>
    );
  }
}
