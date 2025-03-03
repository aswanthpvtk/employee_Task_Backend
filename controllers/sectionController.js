const Section = require('../models/Section');
const Employee = require('../models/Employee');

// Get all sections
exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.find().sort({ order: 1 });
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const section = new Section(req.body);
    const savedSection = await section.save();
    res.status(201).json(savedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a section
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSection = await Section.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    res.status(200).json(updatedSection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a section
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSection = await Section.findByIdAndDelete(id);
    
    if (!deletedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Update all employees to remove this section
    await Employee.updateMany(
      { 'sections.sectionId': id },
      { $pull: { sections: { sectionId: id } } }
    );
    
    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};