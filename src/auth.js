const mongoose = require('mongoose');
const collection = require('./database');
const cookieParser = require('cookie-parser')

async function authenticateUser(req, res, next) {

    const userId = req.cookies.session;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).send('Unauthorized');
    }

    try {

        const user = await collection.findById(userId);

        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        req.user = user;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = authenticateUser;
