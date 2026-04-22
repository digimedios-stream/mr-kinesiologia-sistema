import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewPatient from './pages/NewPatient';
import ProfessionalCalendar from './pages/ProfessionalCalendar';
import Patients from './pages/Patients';
import Sessions from './pages/Sessions';
import Insurances from './pages/Insurances';
import Reports from './pages/Reports';
import PatientDetails from './pages/PatientDetails';
import MissingOrders from './pages/MissingOrders';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="animate-spin text-primary">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950" translate="no">
      <Sidebar />
      <main className="flex-1 lg:pl-64 min-h-screen transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/pacientes" element={
              <ProtectedRoute>
                <Patients />
              </ProtectedRoute>
            } />

            <Route path="/nuevo-paciente" element={
              <ProtectedRoute>
                <NewPatient />
              </ProtectedRoute>
            } />

            <Route path="/pacientes/:id" element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            } />

            <Route path="/pacientes/:id/editar" element={
              <ProtectedRoute>
                <NewPatient />
              </ProtectedRoute>
            } />

            <Route path="/sesiones" element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            } />

            <Route path="/calendario" element={
              <ProtectedRoute>
                <ProfessionalCalendar />
              </ProtectedRoute>
            } />

            <Route path="/obras-sociales" element={
              <ProtectedRoute>
                <Insurances />
              </ProtectedRoute>
            } />

            <Route path="/reportes" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />

            <Route path="/pacientes-sin-orden" element={
              <ProtectedRoute>
                <MissingOrders />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
