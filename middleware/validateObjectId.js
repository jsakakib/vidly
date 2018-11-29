const Joi = require('joi');

module.exports = function (req) {
    const schema = { id: Joi.objectId() };
    const { error } = Joi.validate(req.params, schema);
    let status;
    let message;
    if (error) {
        message = error.details[0].message;
        status = 404;
    }
    return { message, status };
}