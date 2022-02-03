import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route } from 'react-router-dom';
import Home from './home.component';
import { spaBasePath } from './constants';

const swrConfiguration = {
  // Maximum number of retries when the backend returns an error
  errorRetryCount: 3,
};

const Root: React.FC = () => {
  return (
    <main>
      <SWRConfig value={swrConfiguration}>
        <BrowserRouter basename={spaBasePath}>
          {/** Side Menu goes here */}
          <Route path="/" component={Home} />
        </BrowserRouter>
      </SWRConfig>
    </main>
  );
};

export default Root;
