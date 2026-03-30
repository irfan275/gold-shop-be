const { default: mongoose } = require("mongoose");
const { StatusEnum } = require("../constants/user.constant");
const { getNextSequenceValue } = require("../helper/common.helper");
const { updateUserDetails } = require("../helper/db.helper");
const { GoldReceiveInvoice, Shop } = require("../model");
const Sequence = require("../model/sequence");

// CREATE INVOICE
const createInvoice = async (req, res) => {

  try {

    const { customerId, items,total,shop ,notes,invoiceDate} = req.body;
    if(req.user.role === 'EMPLOYEE' && req.user.shop != shop)
      {
        res.json({
          message: "Not Authorized to create Invoice",
          data: {}
        });
    
      }

    const invoice = await GoldReceiveInvoice({
      customerId,
      items,
      total,
      shop,
      notes,
      invoiceDate
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
    const invoices = await GoldReceiveInvoice.find(query)
      .populate("customerId", "name phone address civilId")
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
    const invoice = await GoldReceiveInvoice.findOne(query)
      .populate("customerId", "name phone address civilId")
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
const getInvoicesByFilter = async (req, res) => {
  try {
    const { invoiceNumber, customerId, page = 1, limit = 10 } = req.query;

    let query = {
      status: { $ne: StatusEnum.DELETED }
    };
    if(req.user.role === 'EMPLOYEE')
    {
      query.shop= new mongoose.Types.ObjectId(String(req.user.shop));
    }

    // 🔥 Priority logic
    if (invoiceNumber) {
      query.invoiceNumber = { $regex: invoiceNumber, $options: "i" };
    } else if (customerId) {
      query.customerId = new mongoose.Types.ObjectId(customerId);
    }

    // ✅ Pagination calc
    const skip = (page - 1) * limit;

    // ✅ Fetch data
    const invoices = await GoldReceiveInvoice.find(query)
        .populate("customerId", "name phone address civilId")
      .populate("shop", "name")
      .populate("createdBy", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // ✅ Total count
    const total = await GoldReceiveInvoice.countDocuments(query);

    res.json({
      data: invoices,
      totalRecords:total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE INVOICE
const updateInvoice = async (req, res) => {

  try {
    if(req.user.role === 'EMPLOYEE' && req.user.shop != req.body.shop)
    {
      res.json({
        message: "Not Authorized to update Invoice",
        data: {}
      });
  
    }
    const invoice = await GoldReceiveInvoice.findByIdAndUpdate(
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
    await GoldReceiveInvoice.findByIdAndUpdate(
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

const getInvoiceNumber= async (req, res) => {

  try {
    const shop = await Shop.findOne({_id : req.params.id, status : {$ne : StatusEnum.DELETED}}).lean();
    let seqName = `GR-${shop.shortName}`;
    let sequence = await Sequence.findOne(
      {name:seqName}
    );
    let sequenceNumber = !sequence? 0 : sequence.value;
    res.json({ invoiceNumber : `${seqName}-${sequenceNumber+1}`
    });

  } catch (error) {

    res.status(500).json({
      message: "Error",
      error: error.message
    });

  }

};
module.exports={
    createInvoice,
    getInvoiceById,
    getInvoices,
    updateInvoice,
    deleteInvoice,
    getInvoicesByFilter,
    getInvoiceNumber
}