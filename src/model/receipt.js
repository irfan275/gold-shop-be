const mongoose = require('mongoose');
const { StatusEnum } = require("../constants/user.constant");
const { getNextSequenceValue } = require('../helper/common.helper');
const { getShopById } = require('../controller/shop.controller');
const { Shop } = require('.');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const InvoiceItemSchema = new mongoose.Schema({

  type:{
      type:String
  },
  particular: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  }

});
const ReceiptSchema = new mongoose.Schema({
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


  finalTotal: {
    type: Number,
    required: true
  },
  
  invoiceDate: {
    type: String
  },
  status: {
    type: String,
    default: "ACTIVE"
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

},{ collection: 'Receipt',timestamps: true });
ReceiptSchema.pre("save", async function (next) {
  try {

    if (!this.isNew) {
      return next();
    }

    const shop = await Shop.findById(this.shop);

    if (!shop) {
      return next(new Error("Shop not found"));
    }

    const sequence = await getNextSequenceValue('RE-'+shop.shortName);

    this.invoiceNumber = "RE-"+shop.shortName+"-"+sequence;

    next();

  } catch (error) {
    next(error);
  }
});
const ReceiptInvoice = mongoose.model('Receipt', ReceiptSchema);
module.exports = ReceiptInvoice;
