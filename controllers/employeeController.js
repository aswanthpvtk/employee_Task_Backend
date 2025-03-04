const Employee = require('../models/Employee');
const Section = require('../models/Section');
const mongoose = require('mongoose');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('employeeId firstName lastName designation status department title profileImage');
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ 
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { employeeId: id }
      ]
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
    try {
      const {
        id,
        firstName,
        lastName,
        employeeId,
        title,
        department,
        workEmail,
        createdAt,
        location,
        personalInfo = {},
        paymentInfo = {}
      } = req.body;
  
      // Validate employeeId
      if (!id) {
        return res.status(400).json({ message: "Employee ID is required" });
      }
  
      // Validate and parse the joining date
      const joiningDate = new Date(createdAt);
      if (isNaN(joiningDate.getTime())) {
        return res.status(400).json({ message: "Invalid joining date format" });
      }
  
      // Fetch all sections dynamically
      const sections = await Section.find();
  
      const mappedSections = sections.map(section => ({
        sectionId: section._id,
        sectionName: section.name,
        fields: section.fields.map(field => ({
          fieldId: field._id,
          name: field.name,
          value: personalInfo[field.name] || paymentInfo[field.name] || '' // Map fields dynamically
        }))
      }));
  
      // Construct employee object
      const employeeData = {
        employeeId: id,
        firstName,
        lastName,
        profileImage: '',
        title,
        joiningDate,
        status: 'active',
        sections: mappedSections,
        workEmail,
        department,
        location,
        personalInfo,
        paymentInfo
      };
  
      const employee = new Employee(employeeData);
      const savedEmployee = await employee.save();
  
      res.status(201).json(savedEmployee);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(400).json({ message: error.message });
    }
  };
  

// Update employee information



exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Identify employee by _id or employeeId
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { employeeId: id };

    // Find employee
    const employee = await Employee.findOne(query);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Ensure `personalInfo` and `paymentInfo` exist
    if (!employee.personalInfo) employee.personalInfo = {};
    if (!employee.paymentInfo) employee.paymentInfo = {};

    // Define which fields belong to personalInfo & paymentInfo
    const personalInfoFields = ["dateOfBirth", "fathersName", "pan", "contactEmail", "mobile", "address"];
    const paymentInfoFields = ["accountNumber", "paymentMode", "pfAccountNumber"];

    // Map fields to `personalInfo`
    personalInfoFields.forEach((field) => {
      if (updates[field] !== undefined) {
        employee.personalInfo[field] = updates[field];
      }
    });

    // Map fields to `paymentInfo`
    paymentInfoFields.forEach((field) => {
      if (updates[field] !== undefined) {
        employee.paymentInfo[field] = updates[field];
      }
    });

    // Update other fields normally
    Object.keys(updates).forEach((key) => {
      if (!personalInfoFields.includes(key) && !paymentInfoFields.includes(key)) {
        employee[key] = updates[key];
      }
    });

    // Save updated employee
    const updatedEmployee = await employee.save();
    return res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployee = await Employee.findOneAndDelete({ 
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { employeeId: id }
      ]
    });
    
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
