import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, user not found'
                });
            }

            req.user = user;
            return next();   // **Return here** prevents fallthrough
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed: ' + error.message
            });
        }
    }

    // This block must also return
    return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
    });
};