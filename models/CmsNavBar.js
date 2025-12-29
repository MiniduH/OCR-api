const mongoose = require('mongoose');

const cmsNavBarSchema = new mongoose.Schema({
  operatorId: {
    type: Number,
    required: [true, 'Please provide an operator ID'],
    unique: true,
  },
  template_id: {
    type: Number,
    required: [true, 'Please provide a template ID'],
  },
  links: [
    {
      label: {
        type: String,
        required: false,
        default: null,
        trim: true,
      },
      href: {
        type: String,
        required: false,
        default: null,
        trim: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
cmsNavBarSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Update updatedAt on findByIdAndUpdate
cmsNavBarSchema.pre('findByIdAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('CmsNavBar', cmsNavBarSchema, 'cms_nav_bar');
