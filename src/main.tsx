import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { startCloudSync } from './lib/cloud';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

void startCloudSync();
