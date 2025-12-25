import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, type RouteObject } from 'react-router-dom';
import App from './app/App';
import { routes } from './app/routes';
import './assets/styles/index.css';
import './assets/styles/bolltest.css';

// Convert AppRoute[] to react-router Routes format
const routerRoutes: RouteObject[] = routes.map(route => ({
  path: route.path,
  element: route.element,
  children: route.children?.map(child => ({
    path: child.path,
    element: child.element
  }))
}));

// Add catch-all route
routerRoutes.push({
  path: '*',
  element: <Navigate to="/" replace />
});

// Create router with React Router v7 future flags enabled
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: routerRoutes
    }
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
