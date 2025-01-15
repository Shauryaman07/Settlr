import { useOrganization, useUser } from '@clerk/clerk-react';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ExpenseList from './ExpenseList';

const Expenses = () => {
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isOrgLoaded } = useOrganization();
  const [searchParams] = useSearchParams();

  if (!isUserLoaded || !isOrgLoaded) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4 text-red-600">Please sign in to view organizations.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Organizations</h1>
          <div className="bg-white rounded-lg shadow-sm">
            <ExpenseList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses; 