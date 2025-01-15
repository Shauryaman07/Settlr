import { useOrganization, useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ExpenseList.css';

// Profile Icon Component
const ProfileIcon = ({ firstName, lastName }) => {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  return (
    <div className="profile-icon">
      {initials}
    </div>
  );
};

const GroupDetails = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  console.log('Current orgId:', orgId);

  const { 
    organization, 
    isLoaded: isOrgLoaded,
    memberships,
    invitations
  } = useOrganization({ 
    organizationId: orgId,
    memberships: { infinite: true },
    invitations: { infinite: true }
  });

  const { user, isLoaded: isUserLoaded } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!organization || !user) {
        console.log('Missing required data:', {
          organization: !!organization,
          user: !!user
        });
        return;
      }
      
      try {
        setLoading(true);
        // Extract just the ID part after the last slash if present
        const idPart = orgId.includes('/') ? orgId.split('/').pop() : orgId;
        console.log('ID part:', idPart);
        
        // Clean the organization ID - remove 'org_' prefix and any special characters
        const cleanOrgId = idPart.replace(/^org_/, '').replace(/[^a-zA-Z0-9]/g, '');
        console.log('Cleaned organization ID:', cleanOrgId);
        
        const apiUrl = `http://localhost:3005/api/groups/${cleanOrgId}/member-details`;
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('API Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch member details: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received member data:', data);
        
        if (!Array.isArray(data)) {
          console.error('Unexpected data format:', data);
          throw new Error('Received invalid data format from server');
        }
        
        setExpenses(data);
      } catch (err) {
        console.error('Error fetching member details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isOrgLoaded && isUserLoaded && orgId) {
      fetchData();
    }
  }, [organization, user, isOrgLoaded, isUserLoaded, orgId]);

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3005/api/groups/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete group');
      }

      navigate('/expenses');
    } catch (err) {
      console.error('Error deleting group:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="expense-list-container">Loading group details...</div>;
  }

  if (error) {
    return (
      <div className="expense-list-container">
        <h1>Error</h1>
        <p className="subtitle">{error}</p>
      </div>
    );
  }

  // Check if current user is an admin
  const isAdmin = organization?.membership?.role === 'admin';

  return (
    <div className="expense-list-container">
      <h1>{organization?.name}</h1>
      
      {/* Group Stats */}
      <div className="group-info">
        <p className="subtitle">Active Members: {memberships?.data?.length || 0}</p>
        <p className="subtitle">Pending Invites: {invitations?.data?.length || 0}</p>
        
        {/* Admin-only delete button */}
        {isAdmin && (
          <button 
            className="delete-group-btn"
            onClick={handleDeleteGroup}
          >
            Delete Group
          </button>
        )}
      </div>

      {/* Member Expenses Section */}
      <div className="expense-list">
        <div className="section-header">
          <h2>Member Expenses</h2>
          <div className="expense-stats">
            <span>Total Expenses: {expenses.length}</span>
          </div>
        </div>
        
        {expenses.length === 0 ? (
          <div className="no-expenses">
            <p className="subtitle">No expenses found for this group.</p>
            <button 
              className="action-btn"
              onClick={() => navigate('/add-bill')}
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="expenses-grid">
            {expenses.map((expense) => {
              const payer = memberships?.data?.find(m => m.publicUserData.userId === expense.paid_by_user_id);
              const firstName = payer?.publicUserData?.firstName || '';
              const lastName = payer?.publicUserData?.lastName || '';
              const payerName = payer ? 
                `${firstName} ${lastName}` : 
                'Unknown';

              return (
                <div key={expense.id} className="expense-card">
                  <div className="expense-info">
                    <div className="expense-header">
                      <ProfileIcon firstName={firstName} lastName={lastName} />
                      <div className="expense-details">
                        <h3>{expense.description}</h3>
                        <div className="expense-meta">
                          <span className="expense-amount">₹{parseFloat(expense.amount).toFixed(2)}</span>
                          <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                        <p className="payer-info">To be paid by: {payerName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetails; 