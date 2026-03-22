const { default: mongoose } = require("mongoose");
const { StatusEnum } = require("../constants/user.constant");
const { getNextSequenceValue } = require("../helper/common.helper");
const { updateUserDetails } = require("../helper/db.helper");
const { Invoice } = require("../model");

// CREATE INVOICE
const createInvoice = async (req, res) => {

  try {

    const { customerId, items, subTotal,vat,total,discount,finalTotal,shop ,notes,invoiceDate} = req.body;
    if(req.user.role === 'EMPLOYEE' && req.user.shop != shop)
      {
        res.json({
          message: "Not Authorized to create Invoice",
          data: {}
        });
    
      }

    const invoice = await Invoice({
      customerId,
      items,
      total,
      shop,
      discount,
      notes,
      subTotal,
      invoiceDate,
      vat,
      finalTotal
    });
    updateUserDetails(req, invoice, true);
    const savedInvoice = await invoice.save();
    res.status(201).json({
      message: "Invoice created successfully",
      data: savedInvoice
    });

  } catch (error) {

    res.status(500).json({
      message: "Error creating invoice",
      error: error.message
    });

  }

};


// GET ALL INVOICES
const getInvoices = async (req, res) => {

  try {

    let query = {
      status: { $ne: StatusEnum.DELETED }
    };
    if(req.user.role === 'EMPLOYEE')
    {
      query.shop= new mongoose.Types.ObjectId(String(req.user.shop));
    }
    const invoices = await Invoice.find(query)
      .populate("customerId", "name phone address civilId")
      .populate("items.itemId", "name purity ")
      .populate("shop", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(invoices);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message
    });

  }

};


// GET SINGLE INVOICE
const getInvoiceById = async (req, res) => {

  try {
    let query = {
      _id: req.params.id,
      status: { $ne: StatusEnum.DELETED }
    };
    if(req.user.role === 'EMPLOYEE')
    {
      query.shop= new mongoose.Types.ObjectId(String(req.user.shop));
    }
    const invoice = await Invoice.findOne(query)
      .populate("customerId", "name phone address civilId")
      .populate("items.itemId", "name type")
      .populate("shop", "name")
      .populate("createdBy", "name");

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    res.json(invoice);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching invoice",
      error: error.message
    });

  }

};


// UPDATE INVOICE
const updateInvoice = async (req, res) => {

  try {
    if(req.user.role === 'EMPLOYEE'&& req.user.shop != req.body.shop)
    {
      res.json({
        message: "Not Authorized to update Invoice",
        data: {}
      });
  
    }
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Invoice updated successfully",
      data: invoice
    });

  } catch (error) {

    res.status(500).json({
      message: "Error updating invoice",
      error: error.message
    });

  }

};


// DELETE INVOICE (Soft Delete)
const deleteInvoice = async (req, res) => {

  try {
    if(req.user.role === 'EMPLOYEE')
      {
        res.json({
          message: "Not Authorized to delete Invoice",
          data: {}
        });
    
      }
    await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: "DELETED" }
    );

    res.json({
      message: "Invoice deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Error deleting invoice",
      error: error.message
    });

  }

};


module.exports={
    createInvoice,
    getInvoiceById,
    getInvoices,
    updateInvoice,
    deleteInvoice
}