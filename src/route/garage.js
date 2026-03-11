const express = require('express');
const router = express.Router();
const {validationRules} = require('../validators/garage.validator');
const {validate} = require('../validators/validate');

const { authenticateToken } = require("../validators/middleware");

const garageController = require('../controller/garage.controller');

// Create a new garage
router.post('/', authenticateToken,validationRules.register_garage(),validate,garageController.createGarage);

// Get all garages
router.get('/', authenticateToken,garageController.getAllGarages);

// Get a garage by ID
router.get('/:id', authenticateToken,garageController.getGarageById);

// Update a garage by ID
router.put('/:id', authenticateToken,garageController.updateGarage);

// Delete a garage by ID
router.delete('/:id',authenticateToken, garageController.deleteGarage);

module.exports = router;