const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Customer, validateCustomer } = require('../models/customer');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

router.post('/', [auth, validate(validateCustomer)], async (req, res) => {
  const customer = new Customer(req.body);
  await customer.save();

  res.send(customer);
});

router.put('/:id', [auth, validate(validateObjectId), validate(validateCustomer)], async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body,
    { new: true });

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

router.delete('/:id', [auth, admin, validate(validateObjectId)], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

router.get('/:id', validate(validateObjectId), async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('The customer with the given ID was not found.');
  res.send(customer);
});

module.exports = router;