const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Set default JWT secret if not provided
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'default_jwt_secret_for_development';
    console.log('Using default JWT secret for development');
}

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'routes/public')));

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// MongoDB Connection
console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('Connected to MongoDB successfully!');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections in database:');
        collections.forEach(collection => {
            console.log('-', collection.name);
        });

        // If users collection exists, show count and sample data
        if (collections.some(c => c.name === 'users')) {
            const userCount = await mongoose.connection.db.collection('users').countDocuments();
            console.log('\nNumber of users in database:', userCount);
            
            // Show sample user data (without passwords)
            const sampleUsers = await mongoose.connection.db.collection('users')
                .find({}, { projection: { password: 0 } })
                .limit(5)
                .toArray();
            console.log('\nSample users in database:', JSON.stringify(sampleUsers, null, 2));
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    console.log('\n=== Token Verification ===');
    console.log('Headers:', req.headers);
    
    // Check multiple sources for the token
    const token = 
        req.header('Authorization')?.replace('Bearer ', '') || // Check Authorization header
        req.cookies?.token || // Check cookies
        req.query?.token || // Check URL query parameters
        req.body?.token; // Check request body
    
    console.log('Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully');
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};

// Protected route middleware
const protectRoute = (req, res, next) => {
    console.log('\n=== Route Protection ===');
    console.log('User:', req.user);
    
    if (!req.user) {
        console.log('No user found in request');
        return res.status(401).json({ message: 'Please login to access this resource' });
    }
    console.log('Route access granted');
    next();
};

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const studySessionRoutes = require('./routes/studySessions');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/study-sessions', studySessionRoutes);

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'routes/public', 'index.html'));
});

// Serve other pages
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'routes/public', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'routes/public', 'login.html'));
});

// Protected routes
app.get('/dashboard', verifyToken, protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'routes/public', 'dashboard.html'));
});

app.get('/planner', verifyToken, protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'routes/public', 'planner.html'));
});

app.get('/study', verifyToken, protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'routes/public', 'study.html'));
});

app.get('/summarizer', verifyToken, protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'routes/public', 'summarizer.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
}); 