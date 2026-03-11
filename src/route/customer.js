const express = require('express');
const router = express.Router();
const {validationRules} = require('../validators/garage.validator');
const {validate} = require('../validators/validate');

const { authenticateToken } = require("../validators/middleware");

const customerController = require('../controller/customer.controller');

// Create a new Customer
router.post('/', authenticateToken,validationRules.register_garage(),validate,customerController.createCusomer);

// Get all Customer
router.get('/', authenticateToken,customerController.getAllCustomer);

// Get a Customer by ID
router.get('/:id', authenticateToken,customerController.getCustomerById);

// Update a Customer by ID
router.put('/:id', authenticateToken,customerController.updateCustomer);

// Delete a Customer by ID
router.delete('/:id',authenticateToken, customerController.deleteCustomer);

module.exports = router;