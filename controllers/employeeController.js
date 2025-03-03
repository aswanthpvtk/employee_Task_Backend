const Employee = require('../models/Employee');
const Section = require('../models/Section');
const mongoose = require('mongoose');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('employeeId firstName lastName designation status department title');
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
    const { section, field, value } = req.body;
    
    // Find the employee
    const employee = await Employee.findOne({ 
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { employeeId: id }
      ]
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // If updating a basic field
    if (!section && field) {
      employee[field] = value;
      const updatedEmployee = await employee.save();
      return res.status(200).json(updatedEmployee);
    }
    
    // If updating a section field
    if (section && field) {
      // Find the section
      const sectionIndex = employee.sections.findIndex(s => s.sectionName === section);
      
      if (sectionIndex === -1) {
        // Section doesn't exist, create it
        // First, check if section exists in the Section model
        const sectionModel = await Section.findOne({ name: section });
        
        if (!sectionModel) {
          return res.status(404).json({ message: 'Section not found' });
        }
        
        // Create new section data
        employee.sections.push({
          sectionId: sectionModel._id,
          sectionName: sectionModel.name,
          fields: [{
            name: field,
            value: value
          }]
        });
      } else {
        // Section exists, find field
        const fieldIndex = employee.sections[sectionIndex].fields.findIndex(f => f.name === field);
        
        if (fieldIndex === -1) {
          // Field doesn't exist, add it
          employee.sections[sectionIndex].fields.push({
            name: field,
            value: value
          });
        } else {
          // Update existing field
          employee.sections[sectionIndex].fields[fieldIndex].value = value;
        }
      }
      
      const updatedEmployee = await employee.save();
      return res.status(200).json(updatedEmployee);
    }
    
    // If updating entire employee or section
    const updatedEmployee = await Employee.findOneAndUpdate(
      { 
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
          { employeeId: id }
        ]
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedEmployee);
  } catch (error) {
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
