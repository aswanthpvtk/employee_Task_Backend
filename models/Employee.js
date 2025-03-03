const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for individual fields within a section
const FieldValueSchema = new Schema({
  fieldId: {
    type: Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  name: { type: String, required: true }, // Field name for easier access
  value: Schema.Types.Mixed
}, { _id: false });

// Schema for storing structured section data
const SectionDataSchema = new Schema({
  sectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  sectionName: { type: String, required: true },
  fields: [FieldValueSchema] // Array of fields
}, { _id: false });

// **Employee Schema**
const EmployeeSchema = new Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  title: String, // Job title
  department: String,
  location: String,
  workEmail: {
    type: String,
    required: [true, 'Work email is required'],
    unique: true
  },
  profileImage: String, // Optional profile picture
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'onLeave', 'terminated'],
    default: 'active'
  },
  sections: [SectionDataSchema], // Dynamic Sections
  personalInfo: {
    dateOfBirth: String,
    fathersName: String,
    pan: String,
    contactEmail: String,
    mobile: String,
    address: String
  },
  paymentInfo: {
    paymentMode: String,
    accountNumber: String,
    pfAccountNumber: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
