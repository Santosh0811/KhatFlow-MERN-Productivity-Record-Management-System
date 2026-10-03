const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
    try {
        const token = req?.headers?.authorization;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. Token not found.",
            });
        }

        const decoded = jwt.verify(token, process.env.ADMIN_SECERET_KEY);

        if (decoded.userId !== process.env.ADMIN_USERID) {
            return res.status(404).json({ message: "Access denied" });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token.",
        });
    }
}

module.exports = adminAuth