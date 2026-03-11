const express = require("express");
const router = express.Router();
const {createItem,updateItem,getAllItems,getItemById,deleteItem} = require("../controller/item.controller");
const {register_item} = require('../validators/item.validator');
const {validate} = require('../validators/validate');

const { authenticateToken } = require("../validators/middleware");

router.post("/", authenticateToken,register_item(),validate,createItem);
router.get("/", authenticateToken,getAllItems);
router.get("/:id", authenticateToken,getItemById);
router.put("/:id", authenticateToken,updateItem);
router.delete("/:id", authenticateToken,deleteItem);

module.exports = router;