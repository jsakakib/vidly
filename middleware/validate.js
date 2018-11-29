// middleware to validate request body/payload
module.exports = (validator) => {
    return (req, res, next) => {
        const { status, message } = validator(req);
        if (message) return res.status(status).send(message);
        next();
    }
}