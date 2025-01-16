import { useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GroupDetails.css';

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
  const { user } = useUser();
  const { setActive } = useOrganizationList();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const { organization, isLoaded: isOrgLoaded, memberships, invitations } = useOrganization({
    organizationId: orgId,
    memberships: {
      infinite: true,
      includePublicUserData: true
    },
    invitations: {
      infinite: true
    }
  });

  useEffect(() => {
    const initializeGroup = async () => {
      try {
        if (!orgId) return;
        
        // Set the active organization
        await setActive({ organization: orgId });
        
        // Fetch expenses for the group
        const idPart = orgId.includes('/') ? orgId.split('/').pop() : orgId;
        const cleanOrgId = idPart.replace(/^org_/, '').replace(/[^a-zA-Z0-9]/g, '');
        
        const response = await fetch(`http://localhost:3005/api/groups/${cleanOrgId}/member-details`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch group expenses');
        }
        
        const data = await response.json();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error initializing group:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      initializeGroup();
    }
  }, [orgId, setActive]);

  if (!isOrgLoaded || loading) {
    return <div className="group-details-container">Loading group details...</div>;
  }

  if (error) {
    return (
      <div className="group-details-container">
        <h1>Error</h1>
        <p className="subtitle">{error}</p>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="group-details-container">
        <h1>Group not found</h1>
        <p className="subtitle">The group you're looking for doesn't exist or you don't have access to it.</p>
        <button 
          className="action-btn"
          onClick={() => navigate('/expenses')}
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const activeMembers = memberships?.data?.filter(member => member.status === 'active') || [];
  const pendingInvites = invitations?.data || [];

  return (
    <div className="group-details-container">
      <h1>{organization?.name || 'Loading...'}</h1>
      
      {/* Group Stats */}
      <div className="group-info">
        <p className="subtitle">Active Members: {organization?.membersCount || activeMembers.length}</p>
        <p className="subtitle">Pending Invites: {pendingInvites.length}</p>
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
              const payer = activeMembers.find(m => m.publicUserData.userId === expense.paid_by_user_id);
              const firstName = payer?.publicUserData?.firstName || '';
              const lastName = payer?.publicUserData?.lastName || '';
              const payerName = payer ? 
                `${firstName} ${lastName}`.trim() || payer.publicUserData.identifier : 
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