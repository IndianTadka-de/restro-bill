const express = require("express");
const router = express.Router();
const xlsx = require("xlsx");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path"); // Add this line at the top of your file
const Counter = require("./models/counter.model");
const Order = require("./models/orderlist.model");
const moment = require('moment');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Creates a new order with items in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableNumber
 *               - orderItems
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "6f13b4f1-1d22-4b66-a97a-fbd06a62cb6d"
 *               tableNumber:
 *                 type: integer
 *                 example: 5
 *               orderDate:
 *                 type: date
 *                 example: 2024-12-27
 *               status:
 *                 type: string
 *                 enum:
 *                   - INPROGRESS
 *                   - COMPLETED
 *                 default: INPROGRESS
 *                 example: INPROGRESS
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - itemName
 *                     - quantity
 *                     - price
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       example: "57e3ab54-9891-442d-9c26-97f69fcdfab8"
 *                     itemName:
 *                       type: string
 *                       example: "Laptop"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     price:
 *                       type: number
 *                       example: 1000
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order created successfully"
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: "6f13b4f1-1d22-4b66-a97a-fbd06a62cb6d"
 *                     tableNumber:
 *                       type: integer
 *                       example: 5
 *                     orderDate:
 *                       type: date
 *                       example: 2024-12-27
 *                     status:
 *                       type: string
 *                       enum:
 *                         - INPROGRESS
 *                         - COMPLETED
 *                       example: INPROGRESS
 *                     orderItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           itemId:
 *                             type: string
 *                             example: "57e3ab54-9891-442d-9c26-97f69fcdfab8"
 *                           itemName:
 *                             type: string
 *                             example: "Laptop"
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           price:
 *                             type: number
 *                             example: 1000
 *       400:
 *         description: Error creating order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating order"
 */

router.post("/orders", async (req, res) => {
  try {
    const {
      tableNumber,
      orderItems,
      orderDate,
      pickupOrder = false, // Default to false if not provided
      status = "INPROGRESS",
    } = req.body;

    // Validate if tableNumber is provided when pickupOrder is false
    if (!pickupOrder && !tableNumber) {
      return res.status(400).json({
        message: "Table number is required unless it's a pickup order.",
      });
    }

    // Increment the counter value for 'orderId'
    const counter = await Counter.findByIdAndUpdate(
      { _id: "orderId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const displayId = `B${String(counter.seq).padStart(8, "0")}`;

    const newOrder = new Order({
      tableNumber,
      orderItems,
      orderDate,
      pickupOrder,
      displayId,
      status,
    });

    const existingOrder = await Order.findOne({
      tableNumber,
      status: { $ne: "COMPLETED" },
    });

    if (existingOrder) {
      return res.status(400).json({
        message: "An active order already exists for this table. Please update the existing order!",
      });
    }

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating order",
      error: error.message,
    });
  }
});


/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieves all orders from the system.
 *     responses:
 *       200:
 *         description: A list of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   itemName:
 *                     type: string
 *                   category:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   price:
 *                     type: number
 *                   _id:
 *                     type: string
 *       400:
 *         description: Error fetching orders
 */
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();

    if (orders.length === 0) {
      return res.status(404).json({
        message: "No orders found",
      });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
});


/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a specific order by OrderId
 *     description: Retrieves a single order using its OrderId.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The order with the specified OrderId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 676e56a58ce24132d453ac80
 *                 tableNumber:
 *                   type: integer
 *                   example: 5
 *                 orderItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: string
 *                         example: "1"
 *                       itemName:
 *                         type: string
 *                         example: "Samosa"
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       category:
 *                         type: string
 *                         example: indische_vorspeisen
 *                       price:
 *                         type: number
 *                         example: 6.5
 *                 orderId:
 *                   type: string
 *                   example: "cbe0192e-e6a4-47eb-ab35-dcab7af40874"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-27T07:26:29.649Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-27T07:26:29.649Z"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 */
router.get("/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({
      message: "Error fetching order",
      error: error.message,
    });
  }
});


/**
 * @swagger
 * /api/orders/{orderId}:
 *   put:
 *     summary: Update an existing order
 *     description: Updates an order's details, including table number, order date, and multiple items.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableNumber:
 *                 type: integer
 *                 example: 3
 *               orderDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-27"
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       example: "1"
 *                     itemName:
 *                       type: string
 *                       example: "Samosa"
 *                     quantity:
 *                       type: integer
 *                       example: 7
 *                     category:
 *                       type: string
 *                       example: indische_vorspeisen
 *                     price:
 *                       type: number
 *                       example: 6.5
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.put("/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { tableNumber, orderDate, orderItems } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: "Please select at least one item to update the order.",
      });
    }

    const existingOrder = await Order.findOne({ orderId });

    if (!existingOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    existingOrder.tableNumber = tableNumber;
    existingOrder.orderDate = orderDate;
    existingOrder.orderItems = orderItems;

    const updatedOrder = await existingOrder.save();

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating order",
      error: error.message,
    });
  }
});


/**
 * @swagger
 * /api/orders/{itemId}:
 *   delete:
 *     summary: Delete an order by ItemId
 *     description: Deletes an order using its ItemId.
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: The ID of the order to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete("/orders/:orderId", async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({
      orderId: req.params.orderId,
    });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
      order: deletedOrder,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error deleting order",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update the status of an order
 *     description: Updates the status of an existing order. The status can either be 'INPROGRESS' or 'COMPLETED'.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order whose status is to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [INPROGRESS, COMPLETED]
 *                 example: "INPROGRESS"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status value or request data
 *       404:
 *         description: Order not found
 */
router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentMethod === undefined || order.paymentMethod === null) {
      return res.status(400).json({
        message: "Order payment method is missing. Please add a payment method before completing the order.",
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
});


/**
 * @swagger
 * /api/orders/{orderId}/paymentMethod:
 *   put:
 *     summary: Update the paymentMethod of an order
 *     description: Updates the paymentMethod of an existing order. The paymentMethod type can either be 'CARD','CASH' and 'PAYPAL'.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order whose status is to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [CARD, CASH,PAYPAL]
 *                 example: "CARD"
 *     responses:
 *       200:
 *         description: Order paymentMethod updated successfully
 *       400:
 *         description: Invalid paymentMethod type or request data
 *       404:
 *         description: Order not found
 */
router.put("/orders/:orderId/paymentMethod", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status === "COMPLETED") {
      return res.status(400).json({
        message: "Order status is completed, so unable to add payment method.",
      });
    }

    order.paymentMethod = paymentMethod;
    await order.save();

    res.status(200).json({
      message: "Order payment updated successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating order payment method",
      error: error.message,
    });
  }
});


router.get("/generate-bill/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  const order = await Order.findOne({ orderId });

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Create a new PDF document
  const doc = new PDFDocument({ size: [204, 841.89], margin: 10 });
  const fileName = `bill_${order.displayId}.pdf`;
  const filePath = path.join(__dirname, fileName);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  // Header information
  doc.fontSize(18).font("Helvetica-Bold").text("Indian Tadka", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Friedrichstraße 69, 66538 Neunkirchen", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Tel.: +4915212628877", { align: "center" });
  doc.moveDown(0.5);

  // Order ID and Date
  doc.fontSize(13).font("Helvetica-Bold").text(order.displayId, { align: "center" });
  doc.moveDown(0.5);
  doc.font('Helvetica').text(moment(order.orderDate).format('YYYY/MM/DD HH:mm'), { align: "center" });
  doc.fontSize(10).text('________________________________');
  doc.moveDown(1);

  // Add Table Number only if it's not a pickup order
  if (!order.pickupOrder) {
    doc.fontSize(12).text(`Table Number: ${order.tableNumber}`);
    doc.moveDown(1);
  }else{
    doc.fontSize(12).font("Helvetica-Bold").text(`Abholung`,{ align: "center" });
    doc.moveDown(1);
  }

  // Items by category
  const itemX = 10;
  const priceX = 50;

  let total = 0;
  const itemByCategory = order.orderItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Loop through each category and items
  Object.keys(itemByCategory).forEach((category) => {
    doc.fontSize(10).font("Helvetica-Bold").text(category);
    doc.moveDown(0.2);

    itemByCategory[category].forEach((item) => {
      const itemTotal = item.quantity * item.price;
      total += itemTotal;

      doc.fontSize(8).font("Helvetica").text(
        `${item.quantity} X ${item.itemName}(#${item?.itemId})`,
        itemX,
        doc.y,
        { width: 100, ellipsis: true, continued: true }
      );
      doc.text(`€${itemTotal.toFixed(2)}`, priceX, doc.y, { align: "right" });
    });
  });

  // Total amount
  doc.moveDown(1);
  doc.fontSize(10).font("Helvetica-Bold").text(`Total: €${total.toFixed(2)}`, { align: "right" });
  doc.moveDown(1);

  // Thank you note
  doc.fontSize(9).font("Helvetica-Bold").text("Vielen Dank für Ihre Bestellung!", { align: "center" });

  doc.end();

  // Send the PDF file as download
  stream.on("finish", () => {
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error downloading the file:", err);
      }
      fs.unlinkSync(filePath);  // Clean up the file after sending
    });
  });
});


router.post("/generate-bill-for-person", async (req, res) => {
  const { orderId, personIndex, personItems } = req.body; // Receive the orderId, personIndex, and personItems as payload
  const order = await Order.findOne({ orderId });

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // If no items for this person, return error
  if (!personItems || personItems.length === 0) {
    return res.status(400).json({ error: "No items selected for this person" });
  }

  const doc = new PDFDocument({ size: [204, 841.89], margin: 10 });
  const fileName = `bill_person_${personIndex + 1}_${order.displayId}.pdf`;
  const filePath = path.join(__dirname, fileName);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  // Restaurant Header
  doc.fontSize(18).font("Helvetica-Bold").text("Indian Tadka", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Friedrichstraße 69, 66538 Neunkirchen", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Tel.: +4915212628877", { align: "center" });
  doc.moveDown(0.5);

  // Order and Date
  doc.fontSize(13).font("Helvetica-Bold").text(`Order ID: ${order.displayId}`, { align: "center" });
  doc.moveDown(0.5);
  doc.font('Helvetica').text(moment(order.orderDate).format('YYYY/MM/DD HH:mm'), { align: "center" });
  doc.fontSize(10).text('________________________________');
  doc.moveDown(1);
  doc.fontSize(12).text(`Table Number: ${order.tableNumber}`);
  doc.moveDown(1);

  // Item details
  const itemX = 10;
  const priceX = 50;
  let total = 0;

  // Create an object to categorize items by their category
  const itemByCategory = {};

  // Add category to personItems by matching itemId with orderItems
  personItems.forEach((personItem) => {
    // Find the matching orderItem based on itemId
    const matchedOrderItem = order.orderItems.find(
      (orderItem) => orderItem.itemId === personItem.itemId
    );

    // If a match is found, add the category to the personItem
    if (matchedOrderItem) {
      personItem.category = matchedOrderItem.category;

      // Organize items by category
      if (!itemByCategory[personItem.category]) {
        itemByCategory[personItem.category] = [];
      }
      itemByCategory[personItem.category].push(personItem);
    }
  });

  // Loop through each category and add the items to the PDF
  Object.keys(itemByCategory).forEach((category) => {
    doc.fontSize(10).font("Helvetica-Bold").text(category);
    doc.moveDown(0.2);

    itemByCategory[category].forEach((item) => {
      const itemTotal = item.quantity * item.price;
      total += itemTotal;

      doc.fontSize(8).font("Helvetica").text(
        `${item.quantity} X ${item.itemName} (#${item.itemId})`,
        itemX,
        doc.y,
        { width: 100, ellipsis: true, continued: true }
      );
      doc.text(`€${itemTotal.toFixed(2)}`, priceX, doc.y, { align: "right" });
      doc.moveDown(0.2); // Move to the next line
    });
  });

  // Total for this person
  doc.moveDown(1);
  doc.fontSize(10).font("Helvetica-Bold").text(`Total: €${total.toFixed(2)}`, { align: "right" });
  doc.moveDown(1);

  // Closing message
  doc.fontSize(9).font("Helvetica-Bold").text("Vielen Dank für Ihre Bestellung!", { align: "center" });

  doc.end();

  // Send the PDF to the client
  stream.on("finish", () => {
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error downloading the file:", err);
      }
      fs.unlinkSync(filePath); // Clean up the file after sending
    });
  });
});


/**
 * @swagger
 * /api/orders/exportData:
 *   get:
 *     summary: Export all orders to Excel
 *     description: Generates an Excel file with all orders and their details.
 *     responses:
 *       200:
 *         description: Excel file with orders data
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No orders found
 *       500:
 *         description: Internal server error
 */
router.get("/orders/exportData", async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders.length) {
      return res.status(404).json({
        message: "No orders found to export.",
      });
    }

    const excelData = [];

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        excelData.push({
          OrderID: order.orderId,
          TableNumber: order.tableNumber,
          OrderDate: order.orderDate,
          ItemName: item.itemName,
          Quantity: item.quantity,
          Price: item.price,
          Total: item.quantity * item.price,
        });
      });
    });

    const ws = xlsx.utils.json_to_sheet(excelData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Orders");

    const excelFile = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelFile);
  } catch (err) {
    console.error("Error exporting orders:", err);

    res.status(500).json({
      message: "Internal server error occurred while exporting orders.",
      error: err.message,
    });
  }
});


module.exports = router;
