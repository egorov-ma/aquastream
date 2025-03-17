import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Импортируем i18n (должен быть импортирован перед рендерингом приложения)
import './i18n';

// Импортируем глобальные стили, если есть
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
); 