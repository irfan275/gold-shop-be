const mongoose = require('mongoose');
const { StatusEnum } = require("../constants/user.constant");
const { getNextSequenceValue } = require('../helper/common.helper');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const InvoiceItemSchema = new mongoose.Schema({

  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  premium: {
    type: Number,
    default: 0
  },

  total: {
    type: Number,
    required: true
  }

});
const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: Number,
        unique: true,
    },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  items: [InvoiceItemSchema],

  total: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    default: "ACTIVE"
  },

    Discount: {
        type: Number,
        default : 0
    },

    createdBy : {
        type : ObjectId,
        ref : 'User'
    },
    updatedBy : {
        type : ObjectId,
        ref : 'User',
        //required : true
    },

},{ collection: 'Invoice',timestamps: true });
InvoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.invoiceNumber = await getNextSequenceValue("Invoice");
  }
  next();
});
const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;
