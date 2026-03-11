const { body,query } = require('express-validator')
const { Messages } = require('../constants/message.constant')

const validationRules = {
  register_garage : () => {
    return [
        body('name').exists(),
        body('ownerName').exists(),
        // Check if the address object exists
        body('address').exists(),
        // Validate the components of the address object
        body('address.postalCode').optional().isNumeric().withMessage(Messages.POSTAL_CODE_INVALID),
        body('address.street').optional().notEmpty(),
        body('address.city').optional().notEmpty(),
        body('address.country').notEmpty(),
      //body('location',"Please send last name.").exists(),
      //body('phoneNumber',"Please send phone.").exists(),
      //body('zip_code',"Please send zip code.").exists()
    ]
  },

}



module.exports = {
  validationRules
}