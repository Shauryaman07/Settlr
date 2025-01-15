import { SignIn, useAuth } from '@clerk/clerk-react';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import './SignIn.css';

const SignInPage = () => {
  const { userId } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (userId) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="sign-in-container">
      <SignIn 
        routing="path" 
        path="/sign-in" 
        signUpUrl="/sign-up"
        redirectUrl="/"
        appearance={{
          elements: {
            formButtonPrimary: 'clerk-button',
            card: 'clerk-card',
            headerTitle: 'clerk-title'
          }
        }}
      />
    </div>
  );
};

export default SignInPage; 