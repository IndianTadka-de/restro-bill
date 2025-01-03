const express = require("express");
const router = express.Router();
const Booking = require("./model/booking.model");
/**
 * @swagger
 * /api/booking:
 *   post:
 *     tags:
 *       - Booking
 *     summary: Create a new Booking
 *     description: Creates a new booking with bookuing details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingDate
 *               - numberOfPeople
 *               - bookingName
 *             properties:
 *               bookingDate:
 *                 type: date
 *                 example: 2024-12-27
 *               numberOfPeople:
 *                 type: integer
 *                 example: 3
 *               bookingName:
 *                 type: string
 *                 example: 2024-12-27
 *               bookingTime:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 example: +451 2790-5625

 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking created successfully"
 *                 order:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: string
 *                       example: "6f13b4f1-1d22-4b66-a97a-fbd06a62cb6d"
 *                     status:
 *                       type: string
 *                       example: "true"
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
router.post("/booking", async (req, res) => {
  try {
    console.log('Step 1>>>>>>')
    const {
      bookingDate,
      bookingName,
      numberOfPeople,
      bookingTime,
      phoneNumber,
    } = req.body;

    console.log('Step 2>>>>>>')
    const newBooking = new Booking({
      bookingDate,
      bookingName,
      numberOfPeople,
      bookingTime,
      phoneNumber,
    });

    console.log('Step 3>>>>>>',newBooking)

    await newBooking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        bookingId: newBooking.id,
        status: true,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
});

module.exports = router;