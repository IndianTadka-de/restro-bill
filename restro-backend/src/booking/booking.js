const express = require("express");
const router = express.Router();
const Booking = require("./model/booking.model");
/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags:
 *       - Reservations
 *     summary: Create a new Reservations
 *     description: Creates a new reservation with details.
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
 *         description: Reservations created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reservations created successfully"
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
 *         description: Error creating reservation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating reservations"
 */
router.post("/reservations", async (req, res) => {
  try {
    const {
      bookingDate,
      bookingName,
      numberOfPeople,
      bookingTime,
      phoneNumber,
    } = req.body;

    const newBooking = new Booking({
      bookingDate,
      bookingName,
      numberOfPeople,
      bookingTime,
      phoneNumber,
    });

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

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags:
 *       - Reservations
 *     summary: Get all reservations
 *     description: Retrieves all reservations from the system.
 *     responses:
 *       200:
 *         description: A list of all reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bookingName:
 *                     type: string
 *                   bookingDate:
 *                     type: date
 *                   numberOfPeople:
 *                     type: integer
 *                   bookingTime:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *       400:
 *         description: Error fetching orders
 */

router.get("/reservations", async (req, res) => {
  try {
    const reservations = await Booking.find();

    if (reservations.length === 0) {
      return res.status(404).json({
        message: "No reservation found",
      });
    }

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Error fetching reservations: ", error);
    res.status(400).json({
      message: "Error fetching reservations",
      error: error.message,
    });
  }
});



module.exports = router;