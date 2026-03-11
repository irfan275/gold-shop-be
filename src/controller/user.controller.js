const { Messages } = require("../constants/message.constant");
const { StatusCode } = require("../constants/status.constant");
const { ERROR, SUCCESS } = require("../helper/response.helper");
const { User } = require("../model");
const { createToken } = require("../validators/middleware");


exports.loginUser = async (req,res) => {
    //console.log(req.originalUrl);
    try{
        let {email,password} = req.body;
        

        const  user = await User.findOne({email}).select('+password');
        
        if (!user) 
            return ERROR(res, StatusCode.NOT_FOUND,Messages.EMAIL_NOT_REG);
        // Call the comparePassword method to compare the entered password
        const passwordsMatch = await user.comparePassword(password);

        if (!passwordsMatch) {
            return ERROR(res,StatusCode.NOT_FOUND,Messages.LOGIN_INVALID);
        }
        const accessToken = createToken({
            email: user.email,
            role: user.role,
            id: user._id,
        });
        let userData = {
            ...user._doc,
            accessToken
        }
        // Passwords match, login successful
        return SUCCESS(res,userData);

    }catch (e){
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
}
// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { email,firstName, lastName, phoneNumber, profilePicture,roles } = req.body;

        // create user profile information
        const newUser = await User({
            firstName,
            lastName,
            phoneNumber,
            email,
            roles
            //profilePicture
        });
        const user = await User.find({email : email, status : {$ne : StatusEnum.DELETED}});
        if (user) {
            return ERROR(res,StatusCode.BAD_REQUEST,Messages.USER_ALREADY_EXIST);
        }

        updateUserDetails(req,newUser,true);
        const savedUser = await newUser.save();
        return SUCCESS(res,savedUser);
        //res.status(201).json(savedGarage);
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

// Get all garages
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({status : {$ne : StatusEnum.DELETED}});
        return SUCCESS(res,users)
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

// Get a garage by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.find({_id : req.params.id, status : {$ne : StatusEnum.DELETED}});
        if (!user) {
            return SUCCESS(res,StatusCode.BAD_REQUEST,Messages.USER_NOT_FOUND);
        }
        return SUCCESS(res,garage);
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

// Update a garage by ID
exports.updateUser = async (req, res) => {
    try {
        const { email } = req.body;
        if(email)
        {
            console.log("Email can not updated");
            delete req.body.email;
        }
        updateUserDetails(req,req.body,false);
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return SUCCESS(res,StatusCode.BAD_REQUEST,Messages.USER_NOT_FOUND);
        }
        return SUCCESS(res,updatedGarage)
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};

// Delete a garage by ID
exports.deleteUser = async (req, res) => {
    try {
        //const deletedGarage = await Garage.findByIdAndDelete(req.params.id);
        let data = { status : StatusEnum.DELETED};
        updateUserDetails(req,data,false);
        const deleted = await User.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        return SUCCESS(res,{},'User deleted successfully');
    } catch (e) {
        console.log(e)
        return ERROR(res,StatusCode.SERVER_ERROR,Messages.SERVER_ERROR);
    }
};
