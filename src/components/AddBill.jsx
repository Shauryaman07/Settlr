import { useOrganization, useOrganizationList, useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddBill.css';

const userMembershipsParams = {
  userMemberships: {
    infinite: true,
    keepPreviousData: true,
  },
};

const orgMembersParams = {
  memberships: {
    infinite: true,
    includePublicUserData: true,
    keepPreviousData: true,
  },
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

const AddBill = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isLoaded: isOrgListLoaded, userMemberships, setActive } = useOrganizationList(userMembershipsParams);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [billData, setBillData] = useState({
    description: '',
    amount: '',
    selectedOrg: '',
    paidBy: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Get organization details and members for the selected organization
  const { memberships, isLoaded: isOrgMembershipsLoaded } = useOrganization({
    memberships: orgMembersParams.memberships,
    organizationId: selectedOrgId
  });

  // Handle organization selection
  const handleGroupChange = async (e) => {
    const newOrgId = e.target.value;
    setSelectedOrgId(newOrgId);
    setBillData(prev => ({ ...prev, selectedOrg: newOrgId, paidBy: '' }));
    
    if (newOrgId) {
      // Set the active organization to trigger member fetch
      await setActive({ organization: newOrgId });
    }
  };

  // Debug logging for member data
  useEffect(() => {
    if (isOrgMembershipsLoaded && memberships?.data) {
      console.log('Current Organization:', selectedOrgId);
      console.log('Organization Members:', memberships.data);
    }
  }, [isOrgMembershipsLoaded, memberships?.data, selectedOrgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const memberIds = activeMembers.map(member => member.id);
      
      console.log('Submitting bill with data:', {
        description: billData.description,
        amount: billData.amount,
        date: billData.date,
        organization_id: selectedOrgId,
        paid_by_user_id: billData.paidBy,
        split_with_users: memberIds
      });

      const response = await fetch(`${API_URL}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: billData.description,
          amount: parseFloat(billData.amount),
          date: billData.date,
          organization_id: selectedOrgId,
          paid_by_user_id: billData.paidBy,
          split_with_users: memberIds
        }),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save bill');
      }

      // Show success popup
      setShowPopup(true);
      
      // Reset form
      setBillData({
        description: '',
        amount: '',
        selectedOrg: '',
        paidBy: '',
        date: new Date().toISOString().split('T')[0],
      });
      setSelectedOrgId('');

      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving bill:', error);
      alert(error.message || 'Failed to save bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching organizations
  if (!isOrgListLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading your groups...</div>
      </div>
    );
  }

  // Show message if no organizations data is available
  if (!userMemberships?.data) {
    return (
      <div className="add-bill-container">
        <h1>Add a bill</h1>
        <p className="subtitle">Loading your groups...</p>
      </div>
    );
  }

  // Get list of organizations where user is a member
  const organizations = userMemberships.data.map(membership => ({
    id: membership.organization.id,
    name: membership.organization.name,
    role: membership.role
  }));

  // If user has no organizations
  if (organizations.length === 0) {
    return (
      <div className="add-bill-container">
        <h1>Add a bill</h1>
        <p className="subtitle">You need to be part of a group to add bills.</p>
        <div className="error-message">Please create or join a group first.</div>
        <button 
          className="action-btn"
          onClick={() => navigate('/create-group')}
          style={{ marginTop: '1rem' }}
        >
          Create New Group
        </button>
      </div>
    );
  }

  // Get active members for the selected organization
  const activeMembers = memberships?.data
    ?.map(member => {
      const userData = member.publicUserData;
      const isCurrentUser = userData.userId === user?.id;
      let displayName;

      if (isCurrentUser) {
        displayName = 'You';
      } else if (userData.firstName && userData.lastName) {
        displayName = `${userData.firstName} ${userData.lastName}`;
      } else if (userData.firstName) {
        displayName = userData.firstName;
      } else {
        displayName = userData.identifier || userData.emailAddress || 'Unknown Member';
      }

      return {
        id: userData.userId,
        name: displayName,
        role: member.role,
        isCurrentUser
      };
    }) || [];

  return (
    <div className="add-bill-container">
      {showPopup && (
        <div className="success-popup">
          <div className="popup-content">
            <span className="success-icon">✓</span>
            <p>Expense added successfully!</p>
          </div>
        </div>
      )}
      
      <h1>Add a bill</h1>
      <p className="subtitle">Add a new bill to track expenses</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="organization">Select Group</label>
          <select
            id="organization"
            value={selectedOrgId}
            onChange={handleGroupChange}
            required
            className="select-input"
          >
            <option value="">Select a group</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.role})
              </option>
            ))}
          </select>
        </div>

        {selectedOrgId && (
          <>
            <div className="members-list">
              <h3>Group Members</h3>
              {!isOrgMembershipsLoaded ? (
                <div className="loading-message">Loading members...</div>
              ) : activeMembers.length === 0 ? (
                <div className="error-message">No members found in this group</div>
              ) : (
                activeMembers.map((member) => (
                  <div key={member.id} className="member-item">
                    <span className="member-name">{member.name}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                ))
              )}
            </div>

            <div className="form-group">
              <label htmlFor="paidBy">Who paid?</label>
              <select
                id="paidBy"
                value={billData.paidBy}
                onChange={(e) => setBillData(prev => ({ ...prev, paidBy: e.target.value }))}
                required
                className="select-input"
                disabled={!isOrgMembershipsLoaded || !activeMembers.length}
              >
                <option value="">
                  {!isOrgMembershipsLoaded 
                    ? 'Loading members...' 
                    : 'Select who paid'}
                </option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            value={billData.description}
            onChange={(e) => setBillData(prev => ({ ...prev, description: e.target.value }))}
            required
            className="text-input"
            placeholder="What was this expense for?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            value={billData.amount}
            onChange={(e) => setBillData(prev => ({ ...prev, amount: e.target.value }))}
            required
            className="text-input"
            placeholder="Amount in ₹"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={billData.date}
            onChange={(e) => setBillData(prev => ({ ...prev, date: e.target.value }))}
            required
            className="date-input"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={!isOrgMembershipsLoaded || !selectedOrgId || !activeMembers.length || isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Bill'}
        </button>
      </form>
    </div>
  );
};

export default AddBill;