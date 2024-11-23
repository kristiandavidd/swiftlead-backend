const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
        req.user = decoded; 
        next(); 
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Invalid or Expired Token.' });
    }
};

module.exports = authMiddleware;
