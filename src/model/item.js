const mongoose = require('mongoose');
const { StatusEnum } = require("../constants/user.constant");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required : true
    },
    cost: {
        type: Number,
        default : 0
    },
    weight: {
        type: Number,
        default : 0
    },
    premium: {
        type: Number,
        default : 0
    },
    purity: {
        type: Number,
        default : 24
    },
    status: {
        type: String,
        enum: Object.keys(StatusEnum),
        default: 'ACTIVE', // Optional: Set a default value
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
  },{ collection: 'Item',timestamps: true });

const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;

  