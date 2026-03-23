import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import VoterApp from './VoterApp'; // Make sure you created VoterApp.tsx too!
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <VoterApp />
    </BrowserRouter>
  </React.StrictMode>
);
