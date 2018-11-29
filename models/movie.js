const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema } = require('./genre')

const Movie = mongoose.model('Movies', new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    }
}));

function validateMovie(req) {
    const schema = {
        title: Joi.string().min(5).max(255).required(),
        genreId: Joi.objectId().required(),
        numberInStock: Joi.number().min(0).max(255).required(),
        dailyRentalRate: Joi.number().min(0).max(255).required()
    };

    console.log('payload :', req.body);
    const { error } = Joi.validate(req.body, schema);
    let status;
    let message;

    if (error) {
        message = error.details[0].message;
        status = 400;
        console.log(message, '\n');
    }
    return { message, status };
}

exports.Movie = Movie;
exports.validateMovie = validateMovie;