const jwt = require('jsonwebtoken');
const secretToken = "tecweb2223";
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token.replace('Bearer ', ''), secretToken, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}

module.exports = { authenticateToken, secretToken };
// module.exports = secretToken;
