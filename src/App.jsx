import { ClerkProvider } from '@clerk/clerk-react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AddBill from './components/AddBill';
import CreateGroup from './components/CreateGroup';
import Expenses from './components/Expenses';
import GroupDetails from './components/GroupDetails';
import GroupList from './components/GroupList';
import GroupPage from './components/GroupPage';
import LandingPage from './components/LandingPage';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

function App() {
  return (
    <div className="app-container">
      <ClerkProvider 
        publishableKey={clerkPubKey}
      >
        <Router>
          <Navigation />
          <div className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/sign-in/*" element={<SignIn />} />
              <Route path="/sign-up/*" element={<SignUp />} />
              
              {/* Protected routes */}
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
                    <Expenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <GroupList />
                  </ProtectedRoute>
                }
              />
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
                path="/group/:orgId"
                element={
                  <ProtectedRoute>
                    <GroupDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/group/:orgId/expenses"
                element={
                  <ProtectedRoute>
                    <GroupPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ClerkProvider>
    </div>
  );
}

export default App; 
