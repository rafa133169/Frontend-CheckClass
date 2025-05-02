import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import AdminPanel from './components/Admin/AdminPanel';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { initializeMockData } from './utilities/storage';
import RegisterForm from './components/Auth/RegisterForm';

const App = () => {
  const [user, setUser] = useState(null);

  // Inicializar datos de prueba en desarrollo
  useEffect(() => {
    initializeMockData();
    
    // Verificar si hay un usuario en sesión
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <main className="container mx-auto py-8 px-4">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to={`/${user.role}`} /> : <LoginForm onLogin={handleLogin} />} 
            />
            <Route 
  path="/register" 
  element={user ? <Navigate to={`/${user.role}`} /> : <RegisterForm />} 
/>
            
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/teacher" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="*" 
              element={<Navigate to={user ? `/${user.role}` : '/'} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;