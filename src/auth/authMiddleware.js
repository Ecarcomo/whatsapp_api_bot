import 'dotenv/config';

const authMiddleware = (req, res, next) => {
    const password = req.headers['x-api-password'];
    if (!password) {
        return res.status(401).send('Missing API password');
    }
    if (password !== process.env.API_PASSWORD) {
        return res.status(403).send('Invalid API password');
    }
    next();
};

export default authMiddleware;