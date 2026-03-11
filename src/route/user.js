const express = require('express');
const router = express.Router();
const {validationRules} = require('../validators/user.validator');
const {validate} = require('../validators/validate');
const { authenticateToken } = require("../validators/middleware");
const userController = require('../controller/user.controller');

router.post('/login', validationRules.login(),validate,userController.loginUser);

// Create a new user
router.post('/', authenticateToken,validationRules.register_user(),validate,userController.createUser);

// Get all user
router.get('/', authenticateToken,userController.getAllUsers);

// Get a user by ID
router.get('/:id', authenticateToken,userController.getUserById);

// Update a user by ID
router.put('/:id', authenticateToken,userController.updateUser);

// Delete a user by ID
router.delete('/:id',authenticateToken, userController.deleteUser);

module.exports = router;