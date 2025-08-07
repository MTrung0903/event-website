import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import i18n from './i18n'; // Import i18n instance
import { I18nextProvider } from 'react-i18next';
import App from './App';
import Modal from "react-modal";
import '@goongmaps/goong-js/dist/goong-js.css';
Modal.setAppElement("#root");
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </I18nextProvider>
  </React.StrictMode>
);