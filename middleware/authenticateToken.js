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

function getCurrentUserFromToken(token) {
    const decoded = jwt.verify(token.replace('Bearer ', ''), secretToken);
    // const currentUser = decoded.usernsame;
    return decoded;
}
module.exports = { authenticateToken, secretToken, getCurrentUserFromToken };
// module.exports = secretToken;
