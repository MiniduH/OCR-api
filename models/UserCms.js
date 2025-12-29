const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userCmsSchema = new mongoose.Schema({
  operatorId: [
    {
      operatorId: {
        type: Number,
        required: [true, 'Please provide an operatorId'],
        trim: true,
      },
      webUrl: {
        type: String,
        required: false,
        trim: true,
      },
      operatorName: {
        type: String,
        required: [true, 'Please provide an operator name'],
        trim: true,
      },
    },
  ],
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    required: false,
  },
  websiteUrl: {
    type: String,
    required: false,
    trim: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'manager'],
    default: 'manager',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  permissions: [String],
  lastLogin: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userCmsSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userCmsSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('UserCms', userCmsSchema, 'cms_user');
