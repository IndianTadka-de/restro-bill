const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./model/auth.model"); // Adjust path to your User model

async function createAdminUser() {
    const username = "admin";
    const password = "adminpassword"; // Replace with a secure password

    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb+srv://indiantadkadashboard:BFxjxAzdpFAOlLDd@admindashboard.rcvxm.mongodb.net/Indian-Tadka", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the admin user
        const user = new User({ username, password: hashedPassword });
        await user.save();

        console.log("Admin user created successfully!");
        mongoose.disconnect();
    } catch (error) {
        console.error("Error creating admin user:", error);
        mongoose.disconnect();
    }
}

createAdminUser();
