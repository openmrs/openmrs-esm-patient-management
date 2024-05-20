import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './home.comonent';

const Root: React.FC = () => {
  const wardViewBasename = window.getOpenmrsSpaBase() + 'ward';

  return (
    <main>
      <BrowserRouter basename={wardViewBasename}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default Root;
