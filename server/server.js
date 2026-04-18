const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: false, // For easier dev with tailwind CDN / inline scripts
}));
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic route test
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', timestamp: new Date() });
});

// Include API routes
const apiRouter = require('./routes/api');
app.use('/api/v1', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
