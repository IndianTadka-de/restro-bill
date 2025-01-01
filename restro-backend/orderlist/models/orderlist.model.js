const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define the schema for the order
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String, // GUID for OrderId
      required: true,
      default: uuidv4, // Automatically generate a GUID if not provided
    },
    displayId: {
      type: String,
      unique: true,
    },
    tableNumber: {
      type: Number,
      required: function () {
        // Make 'tableNumber' required only if 'pickupOrder' is not true
        return this.pickupOrder !== true;
      },
    },
    pickupOrder: {
      type: Boolean,
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    orderItems: [
      // Array of order items
      {
        itemId: {
          type: String, // GUID for itemId
          required: true,
        },
        itemName: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: false, // Disable the "__v" version key
  }
);

// Remove _id from orderItems when querying
orderSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Remove _id from each order item
    ret.orderItems.forEach((item) => {
      delete item._id;
    });
    return ret;
  },
});

// Create and export the model
const Order = mongoose.model("OrderTest", orderSchema);
module.exports = Order;
