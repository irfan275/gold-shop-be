exports.updateUserDetails = (req, data, isNew = false) =>{

  if(isNew){
    data.createdBy = req.user.id;
  }
  data.updatedBy = req.user.id;
}
