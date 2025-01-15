import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/clerk-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, userId } = useAuth();
  const isLandingPage = location.pathname === '/';
  const isCreateGroupPage = location.pathname === '/create-group';

  // Don't show protected navigation items until auth is loaded
  const showProtectedNav = isLoaded && userId && !isLandingPage;

  return (
    <nav className={`navbar ${!isLandingPage ? 'navbar-dark' : ''}`}>
      <div className="nav-left">
        <span className="logo" onClick={() => navigate('/')}>
          Settlr
        </span>
      </div>
      {showProtectedNav && (
        <div className="nav-center">
          {!isCreateGroupPage && (
            <button 
              className={`nav-link ${location.pathname === '/create-group' ? 'active' : ''}`}
              onClick={() => navigate('/create-group')}
            >
              Create Group
            </button>
          )}
          <button 
            className={`nav-link ${location.pathname === '/add-bill' ? 'active' : ''}`}
            onClick={() => navigate('/add-bill')}
          >
            Add Bill
          </button>
          <button 
            className={`nav-link ${location.pathname === '/expenses' ? 'active' : ''}`}
            onClick={() => navigate('/expenses')}
          >
            Expenses
          </button>
        </div>
      )}
      <div className="nav-right">
        <SignedOut>
          <span className="nav-link static-text">
            Ma Money Split
          </span>
        </SignedOut>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonBox: 'user-button-box',
                userButtonTrigger: 'user-button-trigger',
                userButtonAvatarBox: 'user-button-avatar-box',
                userButtonAvatarImage: 'user-button-avatar-image',
                userButtonPopoverCard: 'user-button-popover'
              }
            }}
            showName={true}
            userProfileMode="navigation"
          />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navigation; 