import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { routes } from './routes';
import DebugBadge from '../shared/components/layout/DebugBadge';
import 'react-toastify/dist/ReactToastify.css';

// Loading fallback component
const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  }}>
    <div style={{
      fontSize: '48px',
      marginBottom: '20px',
      animation: 'spin 1s linear infinite'
    }}>
      ⚡
    </div>
    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}>BOLTEST</h2>
    <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Loading amazing features...</p>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const App: React.FC = () => {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element}>
              {route.children?.map((child) => (
                <Route key={child.path} path={child.path} element={child.element} />
              ))}
              {route.path === '/app/*' && <Route index element={<Navigate to="dashboard" replace />} />}
            </Route>
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <DebugBadge />
    </>
  );
};

export default App;
