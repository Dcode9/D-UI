import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

const container = document.getElementById('root')!;
const win = window as unknown as { __studio_root__?: ReactDOM.Root };
if (!win.__studio_root__) {
  win.__studio_root__ = ReactDOM.createRoot(container);
}
win.__studio_root__.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
