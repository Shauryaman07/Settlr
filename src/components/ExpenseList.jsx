import { useOrganizationList, useUser } from '@clerk/clerk-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ExpenseList.css';

const ExpenseList = () => {
  const navigate = useNavigate();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { 
    isLoaded: isOrgLoaded, 
    userMemberships 
  } = useOrganizationList({
    userMemberships: {
      infinite: true
    }
  });

  // Debug memberships data
  React.useEffect(() => {
    if (isOrgLoaded && userMemberships?.data) {
      console.log('User Memberships:', userMemberships.data.map(m => ({
        orgName: m.organization.name,
        role: m.role,
        publicMetadata: m.organization.publicMetadata
      })));
    }
  }, [isOrgLoaded, userMemberships]);

  const handleGroupClick = (organizationId) => {
    navigate(`/group/${organizationId}`);
  };

  const handleDeleteGroup = async (organizationId, event) => {
    event.stopPropagation(); // Prevent navigation when clicking delete

    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Original organization ID:', organizationId);
      
      // First delete the organization from Clerk
      const organization = userMemberships.data.find(m => m.organization.id === organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Delete from Clerk first
      await organization.organization.destroy();
      console.log('Organization deleted from Clerk');

      // Extract just the ID part after the last slash if present
      const idPart = organizationId.includes('/') ? organizationId.split('/').pop() : organizationId;
      console.log('ID part:', idPart);
      
      // Clean the organization ID - remove 'org_' prefix and any special characters
      const cleanOrgId = idPart.replace(/^org_/, '').replace(/[^a-zA-Z0-9]/g, '');
      console.log('Cleaned organization ID:', cleanOrgId);

      // Then delete from our database
      const response = await fetch(`http://localhost:3005/api/groups/${cleanOrgId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id
        }
      });

      console.log('Delete response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || 'Failed to delete group';
        } catch (e) {
          errorMessage = 'Failed to delete group: Invalid server response';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.text();
      let parsedResult;
      try {
        parsedResult = result ? JSON.parse(result) : { success: true };
      } catch (e) {
        console.warn('Could not parse response as JSON:', result);
        parsedResult = { success: true };
      }
      
      console.log('Delete result:', parsedResult);

      // Show success message
      alert('Group deleted successfully!');

      // Refresh the page to update the list
      window.location.reload();
    } catch (err) {
      console.error('Error deleting group:', err);
      alert(err.message);
    }
  };

  if (!isUserLoaded || !isOrgLoaded) {
    return <div className="expense-list-container">Loading organizations...</div>;
  }

  if (!userMemberships?.data?.length) {
    return (
      <div className="expense-list-container">
        <h1>Organizations</h1>
        <p className="subtitle">You haven't joined any organizations yet.</p>
        <p className="subtitle">Create or join an organization to get started!</p>
      </div>
    );
  }

  return (
    <div className="expense-list-container">
      <h1>Organizations</h1>
      <div className="expense-list">
        {userMemberships.data.map((membership) => {
          // Debug each membership role
          console.log(`Organization ${membership.organization.name} role:`, membership.role);
          
          const isAdmin = membership.role === 'org:admin';
          
          return (
            <div 
              key={membership.organization.id} 
              className="expense-item"
              onClick={() => handleGroupClick(membership.organization.id)}
            >
              <div className="expense-info">
                <div className="expense-header">
                  <div>
                    <h3>{membership.organization.name}</h3>
                    <p className="role-text">Role: {membership.role}</p>
                    <p>{membership.organization.membersCount} members</p>
                    <p className="expense-date">
                      Joined {new Date(membership.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {isAdmin && (
                    <button 
                      className="delete-group-btn"
                      onClick={(e) => handleDeleteGroup(membership.organization.id, e)}
                    >
                      Delete Group
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList; 