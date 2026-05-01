import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import TrackVan from './components/transport/TrackVan';
import TransportNotificationListener from './components/transport/TransportNotificationListener';

const DashboardPage = () => {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

const TrackVanPage = () => {
  const { selectedChild } = useAuth();
  const studentId = selectedChild?.studentId || selectedChild?.id || selectedChild?._id;
  const branchId = selectedChild?.branch;
  
  if (!studentId) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Please select a child to track</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <TrackVan studentId={studentId} branchId={branchId} />
    </Layout>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <>
      <TransportNotificationListener />
      {children}
    </>
  ) : <Navigate to="/login" />;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/track-van" element={
        <ProtectedRoute>
          <TrackVanPage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;