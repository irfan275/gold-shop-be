const mongoose = require('mongoose');
const { StatusEnum } = require("../constants/user.constant");
const { getNextSequenceValue } = require('../helper/common.helper');
const { getShopById } = require('../controller/shop.controller');
const { Shop } = require('.');

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
  discount: {
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
        type: String,
        unique: true,
    },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },
shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true
  },
  items: [InvoiceItemSchema],

  total: {
    type: Number,
    required: true
  },
  subTotal: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    default: "ACTIVE"
  },

    discount: {
        type: Number,
        default : 0
    },
    notes: {
        type: String,
        default : ""
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
  try {

    if (!this.isNew) {
      return next();
    }

    const shop = await Shop.findById(this.shop);

    if (!shop) {
      return next(new Error("Shop not found"));
    }

    const sequence = await getNextSequenceValue(shop.shortName);

    this.invoiceNumber = "Invoice-"+shop.shortName+"-"+sequence;

    next();

  } catch (error) {
    next(error);
  }
});
const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;
