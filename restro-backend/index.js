const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const orderRoutes = require('./orderlist/orderlist'); // Import order routes
const bookingRoutes = require('./booking/booking'); // Import booking routes
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Order Management API',
            description: 'API documentation for Order Management',
            version: '1.0.0',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8080}`, // The base URL
            },
        ],
    },
    apis: ['./orderlist/orderlist.js', './booking/booking.js'], // Path to the Swagger JSDoc comments
};

// Initialize Swagger JSDoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Redirect root to Swagger UI automatically
app.get('/', (req, res) => {
    res.redirect('/api-docs'); // Redirect to Swagger UI
});

// Middleware
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Middleware to enable CORS

// Mount the routes for orders and bookings with the /api prefix
app.use('/api', orderRoutes); // All routes in orderRoutes will be prefixed with /api
app.use('/api', bookingRoutes); // All routes in bookingRoutes will be prefixed with /api

// MongoDB connection using Mongoose
mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
