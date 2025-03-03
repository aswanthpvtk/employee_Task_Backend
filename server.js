const express = require('express');
const cors = require('cors');
const path = require('path'); // Import path module
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
require('dotenv').config();

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/sections', sectionRoutes);

// Serve static assets in production


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
