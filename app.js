const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const uidChecker = require('./services/uidChecker');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.post('/api/check', async (req, res) => {
  const { uid } = req.body;
  const status = await uidChecker.checkSingleUid(uid);
  res.json({ uid, status });
});

app.post('/api/bulk-check', async (req, res) => {
  // Process CSV file and check multiple UIDs
  const results = await uidChecker.processBulkFile(req.file);
  res.json(results);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

