const _ = require('lodash');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre')
const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('name');
  res.send(movies);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  let movie = new Movie(_.omit(req.body, ['genreId']));
  console.log(movie);

  movie.set({
    genre: _.pick(genre, ['_id', 'name'])
  });

  console.log(movie);

  try {
    await movie.save();
  }

  catch (err) {
    res.status(400).send(err.message);
    return
  }

  res.send(movie);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body,
    { new: true });

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.delete('/:id', async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return res.status(404).send('The movie with the given ID was not found.');
  res.send(movie);
});

module.exports = router;