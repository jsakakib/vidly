const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Movie, validateMovie } = require('../models/movie');
const { Genre } = require('../models/genre')
const _ = require('lodash');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('name');
  res.send(movies);
});

router.get('/:id', validate(validateObjectId), async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  res.send(movie);
});

router.post('/', [auth, validate(validateMovie)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(404).send('Invalid genre.');

  let movie = new Movie(_.omit(req.body, 'genreId'));
  movie.set({ genre: _.pick(genre, '_id', 'name') });
  await movie.save();

  res.send(movie);
});

router.put('/:id', [auth, validate(validateObjectId), validate(validateMovie)], async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body,
    { new: true });

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.delete('/:id', [auth, admin, validate(validateObjectId)], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

module.exports = router;