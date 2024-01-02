import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootEl = document.getElementById('root');
const root = rootEl === null ? null : ReactDOM.createRoot(rootEl);

if (root === null) {
  console.error('root element not found during initiation');
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
