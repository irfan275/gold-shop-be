const { body,query } = require('express-validator')
const { Messages } = require('../constants/message.constant')

const validationRules = {
  login : () => {
    return [
      body('email').exists().isEmail().withMessage(Messages.EMAIL_FORMAT_INVALID),
      body('password').exists(),
    ]
  },
  register_user : () => {
    return [
      body('email').exists().isEmail(),
      body('password').exists(),
      body('first_name').exists(),
      body('last_name').exists(),
      // Validate the 'roles' field
      body('roles')
      .exists() // Check if the field exists
      .isArray().withMessage('Roles must be an array') // Check if it's an array
      .custom(value => value.length >= 1).withMessage('At least one role must be provided'), 
      //body('phone').exists(),
    ]
  },

  search_user : () => {
    return [
      body('name', "Please enter name .").exists().isString(),
    ]
  },
  updatePassword : () => {
    return [
      //body('email', "Please send email or password.").exists(),
      body('password', "Please send email or password.").exists()
    ]
  },
  forgotPassword : () => {
    return [
      body('email', "Please send mail.").exists()
    ]
  },
  resetPassword : () => {
    return [
      //body('email', "Please send email.").exists(),
      body('password', "Please send password.").exists(),
      //body('confirmPassword', "Please send password.").exists(),
    ]
  }


}



module.exports = {
  validationRules
}