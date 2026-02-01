/**
 * Example Mongoose Model
 * 
 * This is an example of how to create a Mongoose model for MongoDB.
 * Replace this with your actual models.
 */

import mongoose from 'mongoose';

// Define the schema
const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  value: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
exampleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the model
const Example = mongoose.model('Example', exampleSchema);

export default Example;
