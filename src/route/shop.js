const express = require("express");
const router = express.Router();
const {createShop,deleteShop,getAllShops,getShopById,updateShop} = require("../controller/shop.controller");


const { authenticateToken } = require("../validators/middleware");

router.post("/", authenticateToken,createShop);
router.get("/", authenticateToken,getAllShops);
router.get("/:id", authenticateToken,getShopById);
router.put("/:id", authenticateToken,updateShop);
router.delete("/:id", authenticateToken,deleteShop);

module.exports = router;