import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FirstPage } from '../pages/FirstPage';
import { ResultPage } from '../pages/ResultPage';
import { WeeklyInfoPage } from '../pages/WeeklyInfoPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/weekly-info" element={<WeeklyInfoPage />} />
      </Routes>
    </BrowserRouter>
  );
};