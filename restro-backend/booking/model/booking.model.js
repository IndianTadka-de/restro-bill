const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define the schema for the order
const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String, // GUID for OrderId
      required: true,
      default: uuidv4, // Automatically generate a GUID if not provided
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    bookingName: {
      type: String,
      required: false,
    },
    numberOfPeople: {
      type: Number,
      required: true,
    },
    bookingTime: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    versionKey: false, // Disable the "__v" version key
  }
);

// Remove _id from orderItems when querying
bookingSchema.set("toJSON", {
  transform: (doc, ret) => {
    // Remove _id from each order item
    ret.orderItems.forEach((item) => {
      delete item._id;
    });
    return ret;
  },
});

// Create and export the model
const Booking = mongoose.model("Bookings", bookingSchema);
module.exports = Booking;
