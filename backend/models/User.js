const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const routeHistorySchema = new mongoose.Schema({
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['fuel', 'optimal', 'safe'],
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  duration: Number,
  calculatedAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default
  },
  organization: {
    type: String,
    trim: true
  },
  routeHistory: {
    type: [routeHistorySchema],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 3;
      },
      message: 'Route history cannot exceed 3 routes'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to add route to history (FIFO, max 3)
userSchema.methods.addRoute = function(routeData) {
  // Add new route at the beginning
  this.routeHistory.unshift({
    from: routeData.from,
    to: routeData.to,
    mode: routeData.mode,
    distance: routeData.distance,
    duration: routeData.duration,
    calculatedAt: new Date()
  });
  
  // Keep only last 3 routes
  if (this.routeHistory.length > 3) {
    this.routeHistory = this.routeHistory.slice(0, 3);
  }
  
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
