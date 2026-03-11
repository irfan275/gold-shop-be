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
    deleteItem
  }