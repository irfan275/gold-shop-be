const express = require('express');
const router = express.Router();
const { login_validator, register_user_validator, forgot_password_validator, reset_password_validator, update_user_validator } = require('../validators/user.validator');
const {validate} = require('../validators/validate');
const { authenticateToken } = require("../validators/middleware");
const {loginUser,createUser, getAllUsers, getUserById, deleteUser, updateUser} = require('../controller/user.controller');

router.post('/login', login_validator(),validate,loginUser);

// Create a new user
router.post('/', authenticateToken,register_user_validator(),validate,createUser);

// Get all user
router.get('/', authenticateToken,getAllUsers);

// Get a user by ID
router.get('/:id', authenticateToken,getUserById);

// Update a user by ID
router.put('/:id', authenticateToken,updateUser);

// Delete a user by ID
router.delete('/:id',authenticateToken, deleteUser);

module.exports = router;