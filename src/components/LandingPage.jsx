import { useUser } from '@clerk/clerk-react';
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="landing-container">
      <div className="hero-section">
        <div className="gradient-blur"></div>
        <h1 className="hero-title">
          Split Expenses
          <span className="gradient-text"> Effortlessly</span>
        </h1>
        <p className="hero-subtitle">
          The modern way to manage group expenses and split bills with friends, roommates, and family.
        </p>
        <div className="cta-buttons">
          {!isSignedIn ? (
            <Link to="/sign-in" className="cta-button primary">
              Get Started
            </Link>
          ) : (
            <Link to="/expenses" className="cta-button primary">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Smart Expense Tracking</h3>
            <p>Automatically track who owes what and settle up with ease.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Group Management</h3>
            <p>Create multiple groups for different occasions and manage them effortlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Updates</h3>
            <p>Stay updated with real-time expense tracking and notifications.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your financial data is always encrypted and secure.</p>
          </div>
        </div>
      </div>

      <div className="highlights-section">
        <div className="highlight-content">
          <h2>Why Choose Our Platform?</h2>
          <div className="highlights-grid">
            <div className="highlight-item">
              <span className="highlight-number">01</span>
              <h4>Easy to Use</h4>
              <p>Intuitive interface designed for seamless expense management</p>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">02</span>
              <h4>Fair Split</h4>
              <p>Split bills equally or customize amounts for each person</p>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">03</span>
              <h4>Instant Settlements</h4>
              <p>Calculate and settle expenses with just a few clicks</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        <div className="footer-content">
          <p>© 2024 Expense Splitter. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 