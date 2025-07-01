import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;


const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    if (!JWT_SECRET) {
        return res.status(500).json({ message: 'JWT secret not configured.' });
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

export default { authMiddleware };