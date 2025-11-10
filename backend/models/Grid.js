const mongoose = require('mongoose');

const GridSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bounds: {
    north: { type: Number, required: true },
    south: { type: Number, required: true },
    east: { type: Number, required: true },
    west: { type: Number, required: true },
  },
  resolution: {
    type: Number,
    required: true,
    default: 0.1,
  },
  // For chunked storage (large grids split across multiple documents)
  isChunked: {
    type: Boolean,
    default: false,
  },
  chunkIndex: {
    type: Number,
    default: 0,
  },
  totalChunks: {
    type: Number,
    default: 1,
  },
  cells: [{
    lat: Number,
    lon: Number,
    is_land: {
      type: Boolean,
      default: false,
    },
    obstacle: {
      type: Boolean,
      default: false,
    },
    zone: {
      type: String,
      enum: ['open_water', 'coastal', 'port'],
      default: undefined,
    },
    open_water: {
      type: Boolean,
      default: undefined,
    },
    weather: {
      temperature: Number,
      windSpeed: Number,
      windDirection: Number,
      waveHeight: Number,
      visibility: Number,
      lastUpdated: Date,
    },
    weatherData: {
      temperature: Number,
      windSpeed: Number,
      windDirection: Number,
      waveHeight: Number,
      visibility: Number,
      lastUpdated: Date,
    },
    cost: {
      type: Number,
      default: 1,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for faster queries
GridSchema.index({ isChunked: 1, chunkIndex: 1 });
GridSchema.index({ 'cells.lat': 1, 'cells.lon': 1 });

module.exports = mongoose.model('Grid', GridSchema);
