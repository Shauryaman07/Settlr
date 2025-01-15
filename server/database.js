import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

// Load environment variables from .env file
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}

// Initialize the Neon client with the provided URL
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Helper function to get group member details
async function getGroupMemberDetails(sql, organizationId) {
  try {
    console.log('Fetching member details for organization:', organizationId);
    
    // Check if the ID already contains org_ prefix
    const fullOrgId = organizationId.includes('org_') ? organizationId : `org_${organizationId}`;
    console.log('Using organization ID:', fullOrgId);
    
    const result = await sql`
      SELECT 
        e.id,
        e.description,
        e.amount,
        e.date,
        e.paid_by_user_id,
        e.split_with_users
      FROM expenses e
      WHERE e.organization_id = ${fullOrgId} OR e.organization_id = ${organizationId}
      ORDER BY e.date DESC;
    `;

    console.log('Raw expense data:', result);
    return result;
  } catch (error) {
    console.error('Error fetching group member details:', error);
    throw error;
  }
}

// Helper function to insert a new expense
async function insertExpense({
  description,
  amount,
  date,
  organizationId,
  paidByUserId,
  splitWithUsers
}) {
  try {
    // Ensure splitWithUsers is an array and convert to proper format
    const formattedSplitWithUsers = Array.isArray(splitWithUsers) 
      ? splitWithUsers 
      : [];

    console.log('Attempting to insert expense with data:', {
      description,
      amount,
      date,
      organizationId,
      paidByUserId,
      splitWithUsers: formattedSplitWithUsers
    });

    const result = await sql`
      INSERT INTO expenses (
        description,
        amount,
        date,
        organization_id,
        paid_by_user_id,
        split_with_users
      ) VALUES (
        ${description},
        ${parseFloat(amount)},
        ${date}::date,
        ${organizationId},
        ${paidByUserId},
        array[${formattedSplitWithUsers}]
      )
      RETURNING *;
    `;

    console.log('Insert result:', result);
    
    if (!result || result.length === 0) {
      throw new Error('No result returned from insert operation');
    }

    return result[0];
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      query: error.query,
      params: {
        description,
        amount,
        date,
        organizationId,
        paidByUserId,
        splitWithUsers
      }
    });
    throw new Error(`Database error: ${error.message}`);
  }
}

// Helper function to delete a group and all associated data
async function deleteGroup(sql, organizationId, userId) {
  try {
    console.log('Starting deleteGroup with:', { organizationId, userId });

    // Check if the ID already contains org_ prefix
    const fullOrgId = organizationId.includes('org_') ? organizationId : `org_${organizationId}`;
    console.log('Using organization ID:', fullOrgId);

    // First check if the user is an admin of the group
    const userRole = await sql`
      SELECT role 
      FROM clerk_organizations 
      WHERE (organization_id = ${fullOrgId} OR organization_id = ${organizationId})
      AND user_id = ${userId}
    `;

    console.log('User role query result:', userRole);

    if (!userRole || userRole.length === 0) {
      console.log('No user role found');
      throw new Error('Group not found or user is not a member');
    }

    if (userRole[0].role !== 'org:admin') {
      console.log('User is not an admin');
      throw new Error('Unauthorized: Only admins can delete groups');
    }

    // Begin transaction
    const result = await sql.begin(async (sql) => {
      console.log('Starting deletion transaction');

      // Delete all expenses for the group
      const deletedExpenses = await sql`
        DELETE FROM expenses 
        WHERE organization_id = ${fullOrgId} OR organization_id = ${organizationId}
        RETURNING id
      `;
      console.log('Deleted expenses:', deletedExpenses.length);

      // Delete all member records for the group
      const deletedMembers = await sql`
        DELETE FROM clerk_organizations 
        WHERE organization_id = ${fullOrgId} OR organization_id = ${organizationId}
        RETURNING user_id
      `;
      console.log('Deleted members:', deletedMembers.length);

      if (deletedMembers.length === 0) {
        throw new Error('No members found for deletion');
      }

      return { 
        success: true, 
        message: 'Group and all associated data deleted successfully',
        deletedExpenses: deletedExpenses.length,
        deletedMembers: deletedMembers.length
      };
    });

    return result;
  } catch (error) {
    console.error('Error in deleteGroup:', error);
    throw error;
  }
}

// Test the database connection
async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Export the functions and database instances
export {
  db,
  deleteGroup, getGroupMemberDetails, insertExpense, sql, testConnection
};

