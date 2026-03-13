const { Messages } = require("../constants/message.constant");
const { StatusCode } = require("../constants/status.constant");
const { ERROR, SUCCESS } = require("../helper/response.helper");
const { Item } = require("../model");


const createItem = async (req, res) => {
  try {

    const item = new Item(req.body);
    const savedItem = await item.save();

    res.status(201).json(savedItem);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchItems = async (req, res) => {
  try {

    const { text } = req.query;

    if (!text || text.length < 3) {
      return res.json([]);
    }
    let search=text;
    let aggregateQuery = [];
    
        if (search && search.trim() !== "") {
          if (search.length < 3) {
            return ERROR(res, StatusCode.BAD_REQUEST, Messages.INVALID_LENGTH_ERROR);
          }
    
          // Remove spaces from search for fullName matching
          const cleanedSearch = search.replace(/\s+/g, "");
    
          // Add field without spaces for name matching
          aggregateQuery.push({
            $addFields: {
              fullName: { $replaceAll: { input: "$name", find: " ", replacement: "" }}
            }
          });
    
          // Match using $regex as string (not JS RegExp)
          aggregateQuery.push({
            $match: {
              $or: [
                { fullName: { $regex: cleanedSearch, $options: "i" } }
              ]
            }
          });
        }
    
        // Sort by createdAt descending
        aggregateQuery.push({ $sort: { createdAt: -1 } });
    
        const result = await Item.aggregate(aggregateQuery);
    
        const items = result.length > 0?result : [];

    return res.json({data:items});

  } catch (error) {

    res.status(500).json({
      message: "Error searching items",
      error: error.message
    });

  }
};
const getAllItems = async (req, res) => {
    try {
  
      const items = await Item.find()
        .populate("createdBy", "name")
        .populate("updatedBy", "name");
  
      res.json(items);
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
 const getItemById = async (req, res) => {
    try {
  
      const item = await Item.findById(req.params.id);
  
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
  
      res.json(item);
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
const updateItem = async (req, res) => {
    try {
  
      const item = await Item.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
  
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
  
      res.json(item);
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
const deleteItem = async (req, res) => {
    try {
  
      const item = await Item.findByIdAndDelete(req.params.id);
  
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
  
      res.json({ message: "Item deleted successfully" });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  module.exports={
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
    searchItems
  }