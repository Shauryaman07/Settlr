const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { insertExpense } = require('./database');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// POST endpoint to create a new bill
app.post('/api/bills', async (req, res) => {
  try {
    console.log('Received bill data:', req.body);

    const {
      description,
      amount,
      date,
      organization_id,
      paid_by_user_id,
      split_with_users
    } = req.body;

    const result = await insertExpense({
      description,
      amount,
      date,
      organizationId: organization_id,
      paidByUserId: paid_by_user_id,
      splitWithUsers: split_with_users
    });

    console.log('Bill created successfully:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create bill',
      details: error.stack
    });
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 