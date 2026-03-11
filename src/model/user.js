const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { UserRoles, StatusEnum } = require("../constants/user.constant");
const { addUpdatedByPreSave, addCreatedByPreSave } = require("../helper/db.helper");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: Number,
    },
    profilePicture: {
        type: String, // You can store the URL of the image
    },
    password: {
        type: String,
        required: true,
        select: false, // Don't include password field by default when querying
    },
    status: {
        type: String,
        enum: Object.keys(StatusEnum),
        default: 'ACTIVE', // Optional: Set a default value
      },
    garageIds : {
        type : [ObjectId],
        ref : 'Shop'
    },
    roles: {
        type: [String],
        enum: UserRoles,
        validate: [
            {
                validator: function(value) {
                    // Ensure the role array is not empty
                    return value && value.length > 0;
                },
                message: 'At least one role must be provided'
            },
            {
                validator: function(value) {
                    // Ensure all roles are valid by checking against the enum object
                    return value.every(role => Object.keys(UserRoles).includes(role));
                },
                message: 'Invalid role provided'
            }
        ]
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
  },{ collection: 'User',timestamps: true });

  // Define pre-save middleware
  //UserSchema.plugin(addCreatedByPreSave);
  //UserSchema.plugin(addUpdatedByPreSave);
// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Log the hashed password stored in the database for debugging
        //console.log('Stored Password:', this.password);

        // Compare the candidate password with the hashed password
        const passwordsMatch = await bcrypt.compare(candidatePassword, this.password);

        // Log the result of password comparison
       // console.log('Passwords Match:', passwordsMatch);

        return passwordsMatch;
    } catch (error) {
        // Log any errors that occur during password comparison
        console.error('Error comparing passwords:', error);
        throw error; // Rethrow the error to propagate it up the call stack
    }
};

const User = mongoose.model('User', UserSchema);
module.exports = User;

// Define the super admin user data
const superAdminData = {
    firstName: 'Super',
    lastName : 'admin',
    email: 'super_admin@autoai.com',
    password: 'Test@123', 
    roles: [UserRoles.SUPER_ADMIN],
  };
  
  // Function to create the super admin user
  async function createSuperAdmin() {
    try {
      // Check if the super admin already exists
      const existingUser = await User.findOne({ roles: UserRoles.SUPER_ADMIN });
      if (existingUser) {
        console.log('Super admin already exists.');
        return;
      }
      
      // Create the super admin user
      const superAdmin = new User(superAdminData);
      await superAdmin.save();
      console.log('Super admin created successfully.');
    } catch (error) {
      console.error('Error creating super admin:', error.message);
    } finally {
      // Disconnect from MongoDB after migration
      //mongoose.disconnect();
    }
  }
  
  // Call the function to create the super admin user
  createSuperAdmin();