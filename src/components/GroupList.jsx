import { OrganizationList, useOrganizationList, useUser } from '@clerk/clerk-react';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const GroupList = () => {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { 
    isLoaded: isOrgLoaded, 
    userMemberships,
    setActive 
  } = useOrganizationList({
    userMemberships: {
      infinite: true
    }
  });

  useEffect(() => {
    if (isUserLoaded && isOrgLoaded) {
      console.log('User Memberships:', userMemberships);
      console.log('Current user:', user);
    }
  }, [isUserLoaded, isOrgLoaded, userMemberships, user]);

  if (!isUserLoaded || !isOrgLoaded) {
    return <div className="p-4 text-gray-600">Loading groups...</div>;
  }

  const handleGroupClick = async (organization) => {
    try {
      await setActive({ organization });
    } catch (error) {
      console.error('Error setting active organization:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-700">Your Groups</h2>
        <OrganizationList hidePersonal={true}>
          <OrganizationList.CreateOrganization />
        </OrganizationList>
      </div>
      
      <div className="grid gap-4">
        {userMemberships?.data?.map((membership) => (
          <div 
            key={membership.organization.id} 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleGroupClick(membership.organization)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <Link 
                    to={`/expenses?org=${membership.organization.id}`}
                    className="text-blue-500 text-lg font-semibold hover:text-blue-600 mb-1 block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {membership.organization.name}
                  </Link>
                  <div className="text-gray-500 text-sm">
                    Members: {membership.organization.membersCount}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    Joined: {new Date(membership.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-sm mt-1">
                    Role: {membership.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {(!userMemberships?.data || userMemberships.data.length === 0) && (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You haven't joined any groups yet.</p>
            <p className="text-gray-600 mb-4">Create your first group to get started!</p>
            <OrganizationList>
              <OrganizationList.CreateOrganization />
            </OrganizationList>
          </div>
        )}

        {userMemberships?.hasNextPage && (
          <button
            onClick={() => userMemberships.fetchNext()}
            disabled={userMemberships.isFetching}
            className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {userMemberships.isFetching ? 'Loading...' : 'Load More Groups'}
          </button>
        )}
      </div>

      {/* Debug information */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({
            memberships: userMemberships?.data?.map(m => ({
              orgId: m.organization.id,
              orgName: m.organization.name,
              role: m.role,
              membersCount: m.organization.membersCount
            })),
            isLoaded: isOrgLoaded,
            userId: user?.id
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default GroupList; 