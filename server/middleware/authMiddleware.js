const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json("Vui lòng đăng nhập.");

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json("Token không hợp lệ.");
        req.user = decoded; 
        next();
    });
};

module.exports = authMiddleware;
