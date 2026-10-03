const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET;

const authUser = (req, res, next) => {
    const token = req?.cookies?.khataflow_token;

    if (!token) {
        return res.status(401).json({ message: "Login required" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);

        req.userId = decoded.userId;
        next()
    } catch (error) {
        console.log("Invalid or expired token", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = authUser;