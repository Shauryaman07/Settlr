import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

// Initialize the Neon client with the provided URL
const initializeDatabase = (databaseUrl) => {
  const sql = neon(databaseUrl);
  const db = drizzle(sql);
  return { sql, db };
};

// Helper function to insert a new expense
async function insertExpense(sql, {
  description,
  amount,
  date,
  organizationId,
  paidByUserId,
  splitWithUsers
}) {
  try {
    console.log('Inserting expense with data:', {
      description,
      amount,
      date,
      organizationId,
      paidByUserId,
      splitWithUsers
    });

    const result = await sql`
      INSERT INTO expenses (
        description,
        amount,
        date,
        organization_id,
        paid_by_user_id,
        split_with_users
      )
      VALUES (
        ${description},
        ${parseFloat(amount)},
        ${date}::date,
        ${organizationId},
        ${paidByUserId},
        ${splitWithUsers}::text[]
      )
      RETURNING *`;

    console.log('Expense inserted successfully:', result);
    return result[0];
  } catch (error) {
    console.error('Error in insertExpense:', error);
    throw error;
  }
}

// Helper function to get expenses for an organization
async function getOrganizationExpenses(sql, organizationId) {
  try {
    const query = `
      SELECT * FROM expenses 
      WHERE organization_id = $1 
      ORDER BY date DESC, created_at DESC;
    `;
    
    const result = await sql.query(query, [organizationId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching organization expenses:', error);
    throw error;
  }
}

// Helper function to get expenses for a user
async function getUserExpenses(sql, userId) {
  try {
    const query = `
      SELECT * FROM expenses 
      WHERE paid_by_user_id = $1 
         OR $1 = ANY(split_with_users)
      ORDER BY date DESC, created_at DESC;
    `;
    
    const result = await sql.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching user expenses:', error);
    throw error;
  }
}

async function getExpensesByOrganization(sql, organizationId) {
  try {
    console.log('Fetching expenses for organization:', organizationId);
    
    const expenses = await sql`
      SELECT 
        e.*
      FROM expenses e
      WHERE e.organization_id = ${organizationId}
      ORDER BY e.date DESC, e.created_at DESC`;

    console.log('Fetched expenses:', expenses);
    return expenses;
  } catch (error) {
    console.error('Error in getExpensesByOrganization:', error);
    throw error;
  }
}

async function getOrganizationMembers(sql, organizationId) {
  try {
    console.log('Fetching members for organization:', organizationId);
    
    const members = await sql`
      WITH member_data AS (
        SELECT DISTINCT unnest(split_with_users) as user_id
        FROM expenses
        WHERE organization_id = ${organizationId}
      )
      SELECT 
        user_id,
        COUNT(DISTINCT e.id) as expenses_count,
        COALESCE(SUM(e.amount), 0) as total_amount_paid
      FROM member_data
      LEFT JOIN expenses e ON 
        e.organization_id = ${organizationId} AND
        e.paid_by_user_id = user_id
      GROUP BY user_id
      ORDER BY total_amount_paid DESC NULLS LAST`;

    console.log('Fetched members:', members);
    return members;
  } catch (error) {
    console.error('Error fetching organization members:', error);
    throw error;
  }
}

async function getGroupMemberDetails(sql, organizationId) {
  try {
    console.log('Fetching member details for organization:', organizationId);
    
    const result = await sql`
      SELECT 
        e.id,
        e.description,
        e.amount,
        e.date,
        e.paid_by_user_id,
        e.split_with_users
      FROM expenses e
      WHERE e.organization_id = ${organizationId}
      ORDER BY e.date DESC;
    `;

    console.log('Raw expense data:', result);
    return result;
  } catch (error) {
    console.error('Error fetching group member details:', error);
    throw error;
  }
}

// Test database connection
async function testConnection(sql) {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export {
    getExpensesByOrganization, getGroupMemberDetails, getOrganizationExpenses, getOrganizationMembers, getUserExpenses, initializeDatabase,
    insertExpense, testConnection
};

