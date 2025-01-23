import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { deleteGroup, getGroupMemberDetails, insertExpense, sql } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// POST endpoint to create a new bill
app.post('/api/bills', async (req, res) => {
  try {
    console.log('Received bill data:', {
      ...req.body,
      headers: req.headers
    });

    const {
      description,
      amount,
      date,
      organization_id,
      paid_by_user_id,
      split_with_users
    } = req.body;

    // Validate required fields
    if (!description || !amount || !date || !organization_id || !paid_by_user_id) {
      console.error('Missing required fields:', {
        description: !!description,
        amount: !!amount,
        date: !!date,
        organization_id: !!organization_id,
        paid_by_user_id: !!paid_by_user_id
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Clean the organization ID
    const cleanOrgId = organization_id.replace(/^org_/, '');
    console.log('Cleaned organization ID:', cleanOrgId);

    const result = await insertExpense({
      description,
      amount: parseFloat(amount),
      date,
      organizationId: cleanOrgId,
      paidByUserId: paid_by_user_id,
      splitWithUsers: Array.isArray(split_with_users) ? split_with_users : []
    });

    console.log('Bill created successfully:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating bill:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      error: 'Failed to create bill',
      details: error.message
    });
  }
});

// Delete group endpoint
app.delete('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.headers['user-id'];

    console.log('Delete request received:', {
      groupId,
      userId,
      headers: req.headers,
      params: req.params
    });

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }

    // Clean the group ID - remove any special characters
    const cleanGroupId = groupId.replace(/[^a-zA-Z0-9]/g, '');
    console.log('Cleaned group ID:', cleanGroupId);

    const result = await deleteGroup(sql, cleanGroupId, userId);
    console.log('Delete result:', result);
    
    if (!result) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in delete group endpoint:', error);
    if (error.message.includes('Unauthorized')) {
      res.status(403).json({ error: error.message });
    } else if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ 
        error: error.message || 'Failed to delete group'
      });
    }
  }
});

// Add the member details endpoint
app.get('/api/groups/:orgId/member-details', async (req, res) => {
  try {
    const { orgId } = req.params;
    console.log('Fetching member details for organization:', orgId);
    const memberDetails = await getGroupMemberDetails(sql, orgId);
    res.json(memberDetails);
  } catch (error) {
    console.error('Error fetching member details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
