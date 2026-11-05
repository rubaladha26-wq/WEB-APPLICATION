const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { requestLogger } = require('./middleware/loggingMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { processRecurringInvoices } = require('./services/recurringInvoiceService');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible integration with client-side previews & PDFs
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(requestLogger);

// Global API rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Nexus Billing & Invoice Management API',
  });
});

// Mount modular API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// 404 handler for undefined routes
app.use(notFound);

// Global centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Nexus Billing Server running on port ${PORT}`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`=======================================================`);

      // Run initial recurring invoice check
      processRecurringInvoices()
        .then((created) => {
          if (created.length > 0) {
            console.log(`[Recurring Engine] Generated ${created.length} scheduled invoices.`);
          }
        })
        .catch((err) => console.error('[Recurring Engine] Check error:', err.message));
    });

    // Periodic check for recurring invoices every 12 hours
    setInterval(() => {
      processRecurringInvoices().catch((err) =>
        console.error('[Recurring Engine] Periodic check error:', err.message)
      );
    }, 12 * 60 * 60 * 1000);

    return server;
  } catch (err) {
    console.error(`[Server] Failed to initialize server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // In production, log and monitor gracefully
});

module.exports = app;
