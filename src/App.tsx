// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { StoreList } from './pages/StoreList';
import { Profile } from './pages/Profile';
import { AddStore } from './pages/AddStore';
import { StoreListAdmin } from './pages/StoreListAdmin';
import { AddUser } from './pages/AddUser';
import { UserList } from './pages/UserList';
import { StoreOwnerDashboard } from './pages/StoreOwnerDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return session ? children : <Navigate to="/login" />;
}



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/stores"
            element={
              <PrivateRoute>
                <Layout>
                  <StoreList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/add-store"
            element={
              <PrivateRoute>
                <Layout>
                  <AddStore />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/store-list-admin"
            element={
              <PrivateRoute>
                <Layout>
                  <StoreListAdmin />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/add-user"
            element={
              <PrivateRoute>
                <Layout>
                  <AddUser />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/user-list"
            element={
              <PrivateRoute>
                <Layout>
                  <UserList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/store-owner-dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <StoreOwnerDashboard />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;