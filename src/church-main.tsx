// src/church-main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PublicChurchHub } from './components/PublicChurchHub';
import './index.css';

// 1. Get the shop_id from the URL query string (?shop_id=...)
const urlParams = new URLSearchParams(window.location.search);
const shopIdParam = urlParams.get('shop_id');
const shopId = shopIdParam ? parseInt(shopIdParam, 10) : null;

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  if (shopId) {
    root.render(
      <React.StrictMode>
        <PublicChurchHub shopId={shopId} />
      </React.StrictMode>
    );
  } else {
    // 2. Fallback if no shop_id is provided in the URL
    root.render(
      <div className="flex h-screen items-center justify-center font-sans">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-bold text-red-600">Invalid Link</h1>
          <p className="text-gray-600 mt-2">Please use the official link provided by your church.</p>
        </div>
      </div>
    );
  }
}
