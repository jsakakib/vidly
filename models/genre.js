const Joi = require('joi');
const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        unique: true
    }
});
const Genre = mongoose.model('Genre', genreSchema);

function validateGenre(req) {
    const schema = { name: Joi.string().min(5).max(50).required() };
    const { error } = Joi.validate(req.body, schema);
    let status;
    let message;

    if (error) {
        message = error.details[0].message;
        status = 400;
    }
    return { message, status };
}

exports.genreSchema = genreSchema;
exports.Genre = Genre;
exports.validateGenre = validateGenre;