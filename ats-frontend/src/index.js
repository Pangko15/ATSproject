import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ApplyApp from './ApplyApp';   // ✅ 추가
import reportWebVitals from './reportWebVitals';

const isApply = window.location.pathname.startsWith('/apply'); // ✅ 추가

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        {isApply ? <ApplyApp /> : <App />}   {/* ✅ 변경 */}
    </React.StrictMode>
);

reportWebVitals();