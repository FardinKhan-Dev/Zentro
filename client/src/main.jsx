import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './app/store';
import App from './App';

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch((err) => {
    console.log('Service Worker registration failed:', err);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
