import { useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GroupPage.css';

const GroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { setActive } = useOrganizationList();
  const { organization, isLoaded, memberships } = useOrganization({
    memberships: {
      infinite: true,
      includePublicUserData: true
    }
  });

  useEffect(() => {
    const setActiveOrganization = async () => {
      try {
        await setActive({ organization: id });
      } catch (error) {
        console.error("Error setting active organization:", error);
      }
    };

    if (id) {
      setActiveOrganization();
    }
  }, [id, setActive]);

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="error-container">
        <h2>Group not found</h2>
        <p>The group you're looking for doesn't exist or you don't have access to it.</p>
        <button 
          className="action-btn"
          onClick={() => navigate('/create-group')}
        >
          Create New Group
        </button>
      </div>
    );
  }

  const activeMembers = memberships?.data?.filter(member => member.status === 'active') || [];
  const pendingInvites = memberships?.data?.filter(member => member.status === 'pending') || [];
  const createdDate = new Date(organization.createdAt).toLocaleDateString();

  return (
    <div className="group-page-container">
      <header className="group-header">
        <h1>{organization.name}</h1>
        <p className="description">
          {organization.privateMetadata?.description || 'No description provided'}
        </p>
        <div className="group-meta">
          <span>Created: {createdDate}</span>
          <span>Active Members: {activeMembers.length}</span>
          <span>Pending Invites: {pendingInvites.length}</span>
        </div>
      </header>

      <section className="group-content">
        <div className="members-section">
          <h2>Members ({activeMembers.length})</h2>
          <div className="members-list">
            {activeMembers.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-info">
                  <img 
                    src={member.publicUserData?.imageUrl || '/default-avatar.png'} 
                    alt={member.publicUserData?.identifier || 'Member'} 
                    className="member-avatar"
                  />
                  <div className="member-details">
                    <span className="member-name">
                      {member.publicUserData?.identifier}
                      {member.publicUserData?.userId === user?.id && ' (You)'}
                    </span>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
                <span className="member-status active">Active</span>
              </div>
            ))}
          </div>

          {pendingInvites.length > 0 && (
            <>
              <h2 className="pending-header">
                Pending Invites ({pendingInvites.length})
              </h2>
              <div className="members-list">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="member-card pending">
                    <div className="member-info">
                      <div className="member-details">
                        <span className="member-name">
                          {invite.emailAddress}
                        </span>
                        <span className="member-role">Invited</span>
                      </div>
                    </div>
                    <span className="member-status pending">Pending</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="group-actions">
          <button 
            className="action-btn"
            onClick={() => navigate('/add-bill')}
          >
            Add Bill
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate('/expenses')}
          >
            View Expenses
          </button>
        </div>
      </section>
    </div>
  );
};

export default GroupPage; 