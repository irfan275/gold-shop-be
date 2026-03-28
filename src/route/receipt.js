const express = require('express');
const router = express.Router();

const {createInvoice,getInvoices,getInvoiceById,deleteInvoice,updateInvoice, getInvoicesByFilter}= require('../controller/receipt.controller')
const { authenticateToken } = require('../validators/middleware');



// CREATE
router.post("/", authenticateToken,createInvoice);


// GET ALL
router.get("/",authenticateToken, getInvoicesByFilter);



// GET BY ID
router.get("/:id", authenticateToken,getInvoiceById);


// UPDATE
router.put("/:id",authenticateToken, updateInvoice);


// DELETE
router.delete("/:id",authenticateToken, deleteInvoice);




module.exports = router;