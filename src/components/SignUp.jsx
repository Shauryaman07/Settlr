import { SignUp } from '@clerk/clerk-react';
import React from 'react';
import './SignUp.css';

const SignUpPage = () => {
  return (
    <div className="sign-up-container">
      <SignUp 
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/expenses"
        appearance={{
          elements: {
            formButtonPrimary: {
              backgroundColor: '#5833ef',
              '&:hover': {
                backgroundColor: '#4a2bd4'
              }
            },
            card: {
              border: '1px solid #e2e8f0',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
            },
            headerTitle: {
              color: '#1a1b26',
              fontSize: '24px'
            },
            headerSubtitle: {
              color: '#4a5568'
            },
            formFieldInput: {
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            },
            footerActionLink: {
              color: '#5833ef'
            }
          },
          layout: {
            socialButtonsPlacement: 'bottom',
            socialButtonsVariant: 'iconButton',
            privacyPageUrl: '/privacy',
            termsPageUrl: '/terms'
          }
        }}
      />
    </div>
  );
};

export default SignUpPage; 
