import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const UIKitDemo = lazy(() => import('./pages/UIKitDemo'));

function App() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ui-kit" element={<UIKitDemo />} />
        {/* Добавьте дополнительные маршруты по необходимости */}
      </Routes>
    </Suspense>
  );
}

export default App; 