const Joi = require('joi');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const express = require('express');
const router = express.Router();

router.post('/', [auth, validate(validateReturn)], async (req, res, next) => {
    const rental = await Rental.lookup(req.body);

    if (!rental) return res.status(404).send('Rental not found.');

    if (rental.dateReturned) return res.status(400).send('Rental already processed.');

    rental.return();

    await rental.save();

    await Movie.findByIdAndUpdate(rental.movie._id, {
        $inc: { numberInStock: 1 }
    });

    return res.send(rental);
});

function validateReturn(req) {
    const schema = {
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    };
    const { error } = Joi.validate(req.body, schema);
    let status;
    let message;
    if (error) {
        message = error.details[0].message;
        status = 400;
    }
    return { message, status };
}

module.exports = router;