const { Messages } = require("../constants/message.constant");
const { StatusCode } = require("../constants/status.constant");
const { StatusEnum, UserRoles } = require("../constants/user.constant");
const { ERROR, SUCCESS } = require("../helper/response.helper");
const { updateUserDetails, addGarageDetails } = require("../helper/db.helper");
const { Customer } = require("../model");
const { checkUserPrivileges } = require("../utils/roles.utils");
const mongoose = require("mongoose");

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    const { email, name, phone, address,civilId } = req.body;

    // checkUserPrivileges(
    //   res,
    //   req.user.roles,
    //   UserRoles.ADMIN,
    //   UserRoles.MANAGER
    // );

    let customer = await Customer.findOne({
      phone: phone,
      status: { $ne: StatusEnum.DELETED },
    });
    if (customer) {
      return ERROR(
        res,
        StatusCode.BAD_REQUEST,
        Messages.CUSTOMER_ALREADY_EXIST
      );
    }

    const newCustomer = await Customer({
      name,
      phone,
      email,
      address,
      civilId,
    });
    updateUserDetails(req, newCustomer, true);
    const savedCustomer = await newCustomer.save();

    return SUCCESS(res, savedCustomer);
  } catch (e) {
    console.log(e);
    return ERROR(res, StatusCode.SERVER_ERROR, Messages.SERVER_ERROR);
  }
};


// Get all Customer
const getAllCustomer = async (req, res) => {
  try {

    let query = {
      status: { $ne: StatusEnum.DELETED }
    };

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return SUCCESS(res, customers);
  } catch (e) {
    console.log(e);
    return ERROR(res, StatusCode.SERVER_ERROR, Messages.SERVER_ERROR);
  }
};

// Get all customers by filter
const getAllCustomerByFilter = async (req, res) => {
  try {
    let { status, search } = req.query;

    status = status || StatusEnum.ACTIVE;
    let query = {
      status: status
    };
    let aggregateQuery = [{ $match: query }];

    if (search) {
      if (search.length < 3) {
        return ERROR(
          res,
          StatusCode.BAD_REQUEST,
          Messages.INVALID_LENGTH_ERROR
        );
      }
      search = new RegExp(search.replace(/(%20|\s)/gm, ""), "i");
      aggregateQuery.push({
        $addFields: {
          fullName: {
            $replaceAll: {
              input: "$name",
              find: " ",
              replacement: "",
            },
          },
        },
      });
      aggregateQuery.push({
        $match: {
          $or: [
            {
              fullName: search,
            },
            {
              phone: search,
            },
            {
              email: search,
            },
          ],
        },
      });
    }

    aggregateQuery.push({
      $sort: {
        createdAt: -1, // Replace -1 with 1 for ascending order
      },
    });

    const customers = await Customer.aggregate(aggregateQuery);
    return SUCCESS(res, customers);
  } catch (e) {
    console.log(e);
    return ERROR(res, StatusCode.SERVER_ERROR, Messages.SERVER_ERROR);
  }
};

// Get a customer by ID
const getCustomerById = async (req, res) => {
  try {

    let query = {
      _id: req.params.id,
      status: { $ne: StatusEnum.DELETED }
    };
    const customer = await Customer.findOne(query)
      .lean();
    if (!customer) {
      return ERROR(res, StatusCode.NOT_FOUND, Messages.USER_NOT_FOUND);
    }
    return SUCCESS(res, customer);
  } catch (e) {
    console.log(e);
    return ERROR(res, StatusCode.SERVER_ERROR, Messages.SERVER_ERROR);
  }
};

// Update a customer by ID
const updateCustomer = async (req, res) => {
  try {


    let query = { _id: req.params.id, status: { $ne: StatusEnum.DELETED } };
    let customer = await Customer.findOne(query).lean();

    if (!customer) {
      return ERROR(res, StatusCode.NOT_FOUND, Messages.USER_NOT_FOUND);
    }

    let updatedData = {};

    for (let key in req.body) {
      // Check if the key exists in keysToCheck array
      if (
        [
          "name",
          "email",
          "phone",
           "civilId"
        ].includes(key)
      ) {
        // Key exists in the array
        updatedData[key] = req.body[key];
      }
    }
    updateUserDetails(req, updatedData, false);
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    if (!updatedCustomer) {
      return ERROR(res, StatusCode.NOT_FOUND, Messages.USER_NOT_FOUND);
    }
    customer = await Customer.findOne({ _id: updatedCustomer._id })
      .lean();
    return SUCCESS(res, updatedCustomer);
  } catch (e) {
    console.log(e);
    return ERROR(res, StatusCode.SERVER_ERROR, Messages.SERVER_ERROR);
  }
};

// Delete a customer by ID
const deleteCustomer = async (req, res) => {
  try {

    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return ERROR(res, StatusCode.NOT_FOUND, Messages.USER_NOT_FOUND);
    }
    return SUCCESS(res, {}, "Customer deleted successfully");
  } catch (e) {
    console.log(e);
    return ERROR(res, StatusCode.SERVER_ERROR, Messages.SERVER_ERROR);
  }
};

const uploadCustomers = async (req, res) => {
  if (!req.file) {
    return ERROR(res, StatusCode.BAD_REQUEST, "No file uploaded.");
  }

  const records = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const customer = {
        name: row.name,
        company: row.company,
        email: row.email,
        phone: row.phone,
        address: {
          postalCode: row?.postalCode,
          street: row?.street,
          city: row?.city,
          country: row?.country,
        },
      };

      addGarageDetails(req, customer);
      updateUserDetails(req, customer, true);
      records.push(customer);
    })
    .on("end", async () => {
      try {
        await Customer.insertMany(records, { ordered: false });
        console.error("CSV data successfully imported");
        fs.unlinkSync(req.file.path); // Remove the file after processing
        return SUCCESS(res, "CSV data successfully imported!", "");
      } catch (error) {
        // fs.unlinkSync(req.file.path);
        if (error.code === 11000) {
          const failedInserts = error.writeErrors.map(
            (err) => records[err.index]
          );
          const duplicateCount = error.writeErrors.length;
          console.error(
            "CSV imported with duplications skipped",
            duplicateCount
          );
          return SUCCESS(
            res,
            `Data imported successfully with ${duplicateCount}  duplicate rows skipped.`,
            ``
          );
        } else {
          return ERROR(
            res,
            StatusCode.SERVER_ERROR,
            "Error importing CSV data:",
            error
          );
        }
      }
    })
    .on("error", (error) => {
      // fs.unlinkSync(req.file.path);
      console.error("Error reading CSV file:", error);
      return ERROR(
        res,
        StatusCode.SERVER_ERROR,
        "Error importing CSV data:",
        error
      );
    });
};

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllCustomer,
  getCustomerById,
  getAllCustomerByFilter,
  uploadCustomers,
};
