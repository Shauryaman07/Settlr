import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AddBill from './components/AddBill';
import CreateGroup from './components/CreateGroup';
import ExpenseList from './components/ExpenseList';
import GroupPage from './components/GroupPage';
import LandingPage from './components/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import SignInPage from './components/SignIn';
import SignUpPage from './components/SignUp';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const AuthWrapper = ({ children }) => {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return children;
};

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <AuthWrapper>
          <div className="App">
            <Navigation />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/sign-in/*" element={<SignInPage />} />
              <Route path="/sign-up/*" element={<SignUpPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/create-group"
                element={
                  <ProtectedRoute>
                    <CreateGroup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-bill"
                element={
                  <ProtectedRoute>
                    <AddBill />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <ExpenseList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/group/:id"
                element={
                  <ProtectedRoute>
                    <GroupPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthWrapper>
      </Router>
    </ClerkProvider>
  );
}

export default App;
