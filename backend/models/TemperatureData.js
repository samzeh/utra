/**
 * Temperature Data Model
 * 
 * Stores monthly temperature data with year information.
 */

import mongoose from 'mongoose';

const temperatureDataSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    index: true
  },
  jan: {
    type: Number,
    default: null
  },
  feb: {
    type: Number,
    default: null
  },
  mar: {
    type: Number,
    default: null
  },
  apr: {
    type: Number,
    default: null
  },
  may: {
    type: Number,
    default: null
  },
  jun: {
    type: Number,
    default: null
  },
  jul: {
    type: Number,
    default: null
  },
  aug: {
    type: Number,
    default: null
  },
  sep: {
    type: Number,
    default: null
  },
  oct: {
    type: Number,
    default: null
  },
  nov: {
    type: Number,
    default: null
  },
  dec: {
    type: Number,
    default: null
  },
  // Location information
  location: {
    type: String,
    default: null,
    index: true
  },
  // Metadata
  source: {
    type: String,
    default: 'imported'
  },
  importedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for year and location
temperatureDataSchema.index({ year: 1, location: 1 });

// Method to get all monthly values as an array
temperatureDataSchema.methods.getMonthlyValues = function() {
  return [
    this.jan, this.feb, this.mar, this.apr, this.may, this.jun,
    this.jul, this.aug, this.sep, this.oct, this.nov, this.dec
  ];
};

// Static method to calculate average temperature for a year
temperatureDataSchema.statics.getAverageForYear = async function(year) {
  const data = await this.findOne({ year });
  if (!data) return null;
  
  const values = data.getMonthlyValues().filter(v => v !== null && v !== 999.9);
  if (values.length === 0) return null;
  
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const TemperatureData = mongoose.model('TemperatureData', temperatureDataSchema);

export default TemperatureData;
