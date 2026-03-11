const express = require("express");
const router = express.Router();
const itemController = require("../controller/item.controller");
const {validationRules} = require('../validators/garage.validator');
const {validate} = require('../validators/validate');

const { authenticateToken } = require("../validators/middleware");

router.post("/", authenticateToken,itemController.createItem);
router.get("/", authenticateToken,itemController.getAllItems);
router.get("/:id", authenticateToken,itemController.getItemById);
router.put("/:id", authenticateToken,itemController.updateItem);
router.delete("/:id", authenticateToken,itemController.deleteItem);

module.exports = router;