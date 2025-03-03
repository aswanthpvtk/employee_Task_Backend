const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for dynamic fields
const FieldSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'email', 'tel', 'textarea', 'select'],
    default: 'text'
  },
  value: {
    type: Schema.Types.Mixed,
    default: ''
  },
  options: [String], // For select fields
  required: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Dynamic Section Schema
const SectionSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: String,
  fields: [FieldSchema],
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Section', SectionSchema);