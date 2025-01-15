import { useOrganizationList, useUser } from '@clerk/clerk-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateGroup.css';

const CreateGroup = () => {
  const { createOrganization } = useOrganizationList();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [groupName, setGroupName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState([]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteStatus, setInviteStatus] = useState({});

  const handleAddMember = () => {
    if (memberEmail && !members.includes(memberEmail)) {
      setMembers([...members, memberEmail]);
      setMemberEmail('');
    }
  };

  const handleRemoveMember = (emailToRemove) => {
    setMembers(members.filter(email => email !== emailToRemove));
    const newInviteStatus = { ...inviteStatus };
    delete newInviteStatus[emailToRemove];
    setInviteStatus(newInviteStatus);
  };

  const sendInvitation = async (organization, email) => {
    try {
      console.log(`Sending invitation to ${email}`);
      
      // Use inviteMember directly as it was working before
      const invitation = await organization.inviteMember({
        emailAddress: email,
        role: 'org:member',
        redirectUrl: `${window.location.origin}/dashboard`
      });
      
      console.log(`Invitation sent to ${email}:`, invitation);
      
      setInviteStatus(prev => ({
        ...prev,
        [email]: 'sent'
      }));
      
      return true;
    } catch (error) {
      console.error(`Failed to invite ${email}:`, error);
      setInviteStatus(prev => ({
        ...prev,
        [email]: 'failed'
      }));
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInviteStatus({});

    try {
      // Create the organization
      const organization = await createOrganization({
        name: groupName,
        privateMetadata: {
          description: description,
          createdBy: user.id,
          createdAt: new Date().toISOString()
        }
      });

      console.log("Organization created:", organization);

      if (organization) {
        // Send invitations to all members
        for (const email of members) {
          try {
            await sendInvitation(organization, email);
          } catch (inviteError) {
            console.error(`Failed to invite ${email}:`, inviteError);
          }
        }

        // Navigate to the new group page instead of expenses
        navigate(`/group/${organization.id}`);
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-group-container">
      <h1>Create a group</h1>
      <p className="subtitle">Start a new group to track bills and IOUs with friends, family, and more.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter a group name"
          className="group-name-input"
          required
        />

        <div className="input-group">
          <input
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="Invite via email"
            className="member-input"
          />
          <button
            type="button"
            onClick={handleAddMember}
            className="add-member-btn"
            disabled={!memberEmail || !memberEmail.includes('@')}
          >
            +
          </button>
        </div>

        {members.length > 0 && (
          <div className="members-list">
            {members.map((email, index) => (
              <div key={index} className="member-chip">
                {email}
                {inviteStatus[email] && (
                  <span className={`invite-status ${inviteStatus[email]}`}>
                    {inviteStatus[email] === 'sent' ? '✓' : '✗'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveMember(email)}
                  className="remove-member"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell them why you're adding them to this group..."
          className="group-description"
        />

        <button 
          type="submit" 
          className="create-group-btn"
          disabled={isLoading || !groupName || members.length === 0}
        >
          {isLoading ? 'Creating group...' : 'Create group'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup; 