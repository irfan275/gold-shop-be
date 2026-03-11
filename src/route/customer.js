const express = require('express');
const router = express.Router();
const {register_customer} = require('../validators/customer.validator');
const {validate} = require('../validators/validate');

const { authenticateToken } = require("../validators/middleware");

const {createCustomer,updateCustomer,getAllCustomer,getCustomerById,deleteCustomer} = require('../controller/customer.controller');

// Create a new Customer
router.post('/', authenticateToken,register_customer(),validate,createCustomer);

// Get all Customer
router.get('/', authenticateToken,getAllCustomer);

// Get a Customer by ID
router.get('/:id', authenticateToken,getCustomerById);

// Update a Customer by ID
router.put('/:id', authenticateToken,updateCustomer);

// Delete a Customer by ID
router.delete('/:id',authenticateToken,  deleteCustomer);

module.exports = router;