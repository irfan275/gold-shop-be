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
type:{
    type:String
},
  quantity: {
    type: Number,
    required: true
  },

  premium: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  purity: {
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

  subTotal: {
    type: Number,
    required: true
  },
  vat: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  
  discount: {
    type: Number,
    default : 0
},
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
    let seqName = `INV-${shop.shortName}`;
    const sequence = await getNextSequenceValue(seqName);

    this.invoiceNumber = seqName+"-"+sequence;

    next();

  } catch (error) {
    next(error);
  }
});
const Invoice = mongoose.model('Invoice', InvoiceSchema);
module.exports = Invoice;
