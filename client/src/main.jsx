import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'; // 1. Importe o Provider criado
import App from './App';
import Board from './Board';
import Login from './Login';
import Profile from './Profile';
import './index.css';

// Componente que verifica se existe token
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolva toda a aplicação com o ThemeProvider */}
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route path="/" element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          } />
          
          <Route path="/board/:id" element={
            <PrivateRoute>
              <Board />
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);