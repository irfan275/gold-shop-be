const{ default: mongoose } = require("mongoose");
const Sequence = require("../model/sequence");

const compareObjectIdWithString = (objectId, stringId) => {
    // Convert the string to an ObjectId
    const objectIdFromString = new mongoose.Types.ObjectId(stringId);
    // Use the equals method to compare
    return objectId.equals(objectIdFromString);
  };
const populateJobsName = (jobs)=> {
    let names = [];
    for( let job of jobs){
        names.push(job.service.description);
    }
    return names.join(",");
}

const getNextSequenceValue = async (sequenceName) => {
 // const seq = await Sequence.find();
  const sequenceDocument = await Sequence.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.value;
};

  module.exports = {
    compareObjectIdWithString,
    populateJobsName,
    getNextSequenceValue
  }