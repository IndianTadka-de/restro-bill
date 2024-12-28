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
      status = "INPROGRESS",
    } = req.body;
    // Increment the counter value for 'orderId'
    const counter = await Counter.findByIdAndUpdate(
      { _id: "orderId" }, // Counter name
      { $inc: { seq: 1 } }, // Increment sequence
      { new: true, upsert: true } // Create counter if it doesn't exist
    );

    // Format the displayId as "B00000001"
    const displayId = `B${String(counter.seq).padStart(8, "0")}`;

    // Create a new order with the status field
    const newOrder = new Order({
      tableNumber,
      orderItems,
      orderDate,
      displayId,
      status, // Assign status, default is "INPROGRESS"
    });

    // Check if there is already an existing order for the same table with status other than COMPLETED
    const existingOrder = await Order.findOne({
      tableNumber,
      status: { $ne: "COMPLETED" }, // Find order with status not equal to "COMPLETED"
    });

    // If an existing order with non-COMPLETED status exists, prevent creation of the new order
    if (existingOrder) {
      return res.status(400).json({
        message:
          "An active order already exists for this table. Please update the existing order!",
      });
    }

    // Save the new order to the database
    await newOrder.save();

    // Return the newly created order
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
      return res.status(404).json({ message: "Order not found" });
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

    // Validate that there is at least one order item
    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({
          message: "Please select at least one item to update the order.",
        });
    }

    // Find the existing order using `orderId` instead of `_id`
    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the main order details
    existingOrder.tableNumber = tableNumber;
    existingOrder.orderDate = orderDate;

    // Update or replace order items
    existingOrder.orderItems = orderItems;

    // Save the updated order
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

    // Find the order by orderId
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentMethod === undefined || order.paymentMethod === null) {
      return res
        .status(400)
        .json({
          message:
            "Order payment method is missing so Please add payment method before completing the order",
        });
    }

    // Update the order status
    order.status = status;

    // Save the updated order
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

    // Find the order by orderId
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status === "COMPLETED") {
      return res
        .status(400)
        .json({
          message: "Order status is completed so unable to add payment method",
        });
    }

    // Update the order status
    order.paymentMethod = paymentMethod;

    // Save the updated order
    await order.save();

    res.status(200).json({
      message: "Order payment updated successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating order status",
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
  const doc = new PDFDocument({ size: [204, 841.89], margin: 10 });
  const fileName = `bill_${order.displayId}.pdf`;
  const filePath = path.join(__dirname, fileName);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(18).font("Helvetica-Bold").text("Indian Tadka", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Friedrichstraße 69, 66538 Neunkirchen", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Tel.: +4915212628877", { align: "center" });
  doc.moveDown(0.5);
  doc
  .fontSize(13)
  .font("Helvetica-Bold")
  .text(order.displayId,{align:"center"});
  doc.moveDown(0.5)
  //doc.text(order.orderDate);
  doc.font('Helvetica').text(moment(order.orderDate).format('YYYY/MM/DD HH:mm'),{align:"center"});
  doc.fontSize(10).text('________________________________')
  doc.moveDown(1);
  doc.fontSize(12).text(`Table Number: ${order.tableNumber}`);
  doc.moveDown(1);

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
      // doc.text(item.quantity.toString(), qtyX , doc.y, { continued: true});
      doc.text(`€${itemTotal.toFixed(2)}`, priceX, doc.y, { align: "right" });
      //doc.moveDown();
    });
  });

  doc.moveDown(1);
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(`Total: €${total.toFixed(2)}`, { align: "right" });
  doc.moveDown(1);

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("Vielen Dank für Ihre Bestellung!", { align: "center" });

  doc.end();

  stream.on("finish", () => {
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error downloading the file:", err);
      }
      fs.unlinkSync(filePath);
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
  console.log("Export API sssshit");

  try {
    const orders = await Order.find();

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found to export." });
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

    // Set headers to download the file
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelFile);
  } catch (err) {
    console.error("Error exporting orders:", err);

    // Return a 500 error for unexpected issues
    res.status(500).json({
      message: "Internal server error occurred while exporting orders.",
      error: err.message,
    });
  }
});

module.exports = router;
