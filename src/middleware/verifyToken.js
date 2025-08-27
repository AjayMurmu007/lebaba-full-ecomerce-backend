const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        // console.log("frontend token", token)
        
        // const token = req.headers["authorization"].split("")[1];       // test from header
        // console.log("verify Token:", token);
        if (!token) {
            return res.status(401).send({ message: 'No token provided, authorization denied' });
        }
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        // console.log("decoded :", decoded);
        if (!decoded) {
            return res.status(401).send({ message: 'Invalid token, authorization denied' });
        }
        req.userId = decoded.userId; // Attach the decoded user information to the request object
        req.role = decoded.role; // Attach the role to the request object
        next(); // Call the next middleware or route handler

    } catch (error) {
        // console.error("Token verification error:", error);
        return res.status(401).send({ message: 'Token verification failed, authorization denied' });
    }

}


// Export the middleware function to be used in other parts of the application
module.exports = verifyToken;