const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./utils/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'restaurant-worker',
    version: '1.0.0',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Basic routes structure
app.get('/', (req, res) => {
  res.json({
    message: 'Restaurant SaaS Worker API',
    version: '1.0.0',
    endpoints: [
      'GET /healthz',
      'GET /whatsapp/qrcode',
      'POST /whatsapp/send',
      'POST /email/send',
      'POST /webhooks/order-status'
    ]
  });
});

// WhatsApp routes placeholder
app.get('/whatsapp/qrcode', (req, res) => {
  res.json({ message: 'WhatsApp QR endpoint - to be implemented' });
});

app.post('/whatsapp/send', (req, res) => {
  res.json({ message: 'WhatsApp send endpoint - to be implemented' });
});

// Email routes placeholder
app.post('/email/send', (req, res) => {
  res.json({ message: 'Email send endpoint - to be implemented' });
});

// Webhooks placeholder
app.post('/webhooks/order-status', (req, res) => {
  res.json({ message: 'Order status webhook - to be implemented' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Worker server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/healthz`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  process.exit(0);
});