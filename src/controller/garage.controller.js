const { Messages } = require("../constants/message.constant");
const { StatusCode } = require("../constants/status.constant");
const { StatusEnum } = require("../constants/user.constant");
const { updateUserDetails } = require("../helper/db.helper");
const { ERROR, SUCCESS } = require("../helper/response.helper");
const { Shop} = require("../model");


// Create a new garage
exports.createShop = async (req, res) => {
    try {
        const { name, ownerName, address } = req.body;
        const newShop = new Shop({
            name,
            ownerName,
            address,
        });
        updateUserDetails(req,newShop,true);
        const data = await newShop.save();
        return SUCCESS(res,data);
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

// Get all shops
exports.getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find({status : {$ne : StatusEnum.DELETED}});
        return SUCCESS(res,shops)
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

// Get a garage by ID
exports.getShopById = async (req, res) => {
    try {
        const shop = await Shop.find({_id : req.params.id, status : {$ne : StatusEnum.DELETED}});
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        return SUCCESS(res,shop);
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

// Update a shop by ID
exports.updateShop = async (req, res) => {
    try {
        updateUserDetails(req,req.body,false);
        const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedShop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        return SUCCESS(res,updatedShop)
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

// Delete a shop by ID
exports.deleteShop = async (req, res) => {
    try {
        //const deletedShop = await Shop.findByIdAndDelete(req.params.id);
        let data = { status : StatusEnum.DELETED};
        updateUserDetails(req,data,false);
        const deletedShop = await Shop.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!deletedShop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        return SUCCESS(res,{},'Shop deleted successfully');
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};
