const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Movie, validate } = require('../models/customer');
const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const customers = await Movie.find().sort('name');
  res.send(customers);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = new Movie(req.body);
  await customer.save();

  res.send(customer);
});

router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Movie.findByIdAndUpdate(req.params.id, req.body,
    { new: true });

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const customer = await Movie.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

router.get('/:id', async (req, res) => {
  const customer = await Movie.findById(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');
  res.send(customer);
});

module.exports = router;