const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const {jwt}=require("jsonwebtoken");
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Connect to MongoDB
mongoose.connect('mongodb+srv://dataman:dataman@sadnycluster.ghf4xx2.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose Schema and Model
const phase1 = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
});
const User = mongoose.model('User', phase1);

// Define the Zod schema
const userValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().int().positive("Age must be a positive integer"),
});

// Middleware to validate schema
const validateSchema = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  req.validatedData = result.data; // Store validated data in the request object
  next();
};

// Middleware to save data to MongoDB
const saveToDatabase = (Model) => async (req, res, next) => {
  try {
    const newRecord = new Model(req.validatedData);
    const savedRecord = await newRecord.save();
    req.savedRecord = savedRecord; // Store saved record in request object
    next();
  } catch (error) {
    next(error);
  }
};

// Route using the validation and save middleware
app.post('/submit', validateSchema(phase1), saveToDatabase(User), (req, res) => {
  res.json({ message: "Form submitted successfully", data: req.savedRecord });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.get("/",(req,res)=>{
  console.log("hello");
})
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
