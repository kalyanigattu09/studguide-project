// STUGUIDE X - Backend Entry Point (Express API Server)
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const auth = require('./routes/auth');
const profile = require('./routes/profile');
const guidance = require('./routes/guidance');
const mocktest = require('./routes/mocktest');
const placement = require('./routes/placement');
const productivity = require('./routes/productivity');
const forum = require('./routes/forum');
const admin = require('./routes/admin');
const resources = require('./routes/resources');

// Connect to database
connectDB();

const app = express();

// Security Headers
app.use(helmet({
contentSecurityPolicy: false // Allow inline scripts for demo flexibility
}));

// CORS Configuration
app.use(cors({
origin: true, // Allow all origins for dev simplicity
credentials: true
}));

// Body parser & Cookie parser
app.use(express.json());
app.use(cookieParser());

// Rate Limiting (Prevent abuse)
const limiter = rateLimit({
windowMs: 10 * 60 * 1000, // 10 minutes
max: 300, // limit each IP to 300 requests per windowMs
message: { success: false, error: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// Mount API routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/guidance', guidance);
app.use('/api/mocktest', mocktest);
app.use('/api/placement', placement);
app.use('/api/productivity', productivity);
app.use('/api/forum', forum);
app.use('/api/admin', admin);
app.use('/api/resources', resources);

// Root Route
app.get('/', (req, res) => {
res.json({ message: "STUGUIDE X Backend API Server is running." });
});

// Centralized error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
console.log(`[Server] STUGUIDE X running on Port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
console.error(`[Fatal] Error: ${err.message}`);
// Close server & exit process
// server.close(() => process.exit(1));
});
