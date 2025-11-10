const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Increase server timeout for long route calculations (25 minutes)
const server = require('http').createServer(app);
server.timeout = 1500000; // 25 minutes
server.keepAliveTimeout = 1500000;
server.headersTimeout = 1505000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    // Check if MongoDB URI is loaded
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/grid', require('./routes/grid'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/route', require('./routes/route'));
app.use('/api/ports', require('./routes/ports'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Maritime Navigation API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`⏱️ Request timeout: 25 minutes (for complex route calculations)`);
});
