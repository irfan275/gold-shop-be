const { Messages } = require("../constants/message.constant");
const { StatusCode } = require("../constants/status.constant");
const { ERROR, SUCCESS } = require("../helper/response.helper");
const { Customer } = require("../model");

// Create a new Customer
exports.createCusomer = async (req, res) => {
    try {
        const { email,firstName, lastName, phoneNumber, profilePicture,civilId } = req.body;

        // create user profile information
        const newCustomer = await newCustomer({
            firstName,
            lastName,
            phoneNumber,
            civilId,
            email
            //profilePicture
        });
        const user = await Customer.find({civilId : civilId, status : {$ne : StatusEnum.DELETED}});
        if (user) {
            return ERROR(res,StatusCode.BAD_REQUEST,Messages.USER_ALREADY_EXIST);
        }

        updateUserDetails(req,newCustomer,true);
        const savedUser = await newUser.save();
        return SUCCESS(res,savedUser);
        //res.status(201).json(savedGarage);
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

exports.getAllCustomer = async (req, res) => {
    try {
        const users = await Customer.find({status : {$ne : StatusEnum.DELETED}});
        return SUCCESS(res,users)
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const user = await Customer.find({_id : req.params.id, status : {$ne : StatusEnum.DELETED}});
        if (!user) {
            return SUCCESS(res,StatusCode.BAD_REQUEST,Messages.USER_NOT_FOUND);
        }
        return SUCCESS(res,garage);
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        updateUserDetails(req,req.body,false);
        const updatedUser = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return SUCCESS(res,StatusCode.BAD_REQUEST,Messages.USER_NOT_FOUND);
        }
        return SUCCESS(res,updatedGarage)
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};


exports.deleteCustomer = async (req, res) => {
    try {
        //const deletedGarage = await Garage.findByIdAndDelete(req.params.id);
        let data = { status : StatusEnum.DELETED};
        updateUserDetails(req,data,false);
        const deleted = await Customer.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        return SUCCESS(res,{},'User deleted successfully');
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};
