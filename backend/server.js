// Entry point for the backend server
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-grades', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const studentSchema = new mongoose.Schema({
  student_id: String,
  student_name: String,
  total_marks: Number,
  marks_obtained: Number,
  percentage: Number,
  created_at: { type: Date, default: Date.now },
});

const Student = mongoose.model('Student', studentSchema);

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    let students = [];
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      // Parse CSV
      const csvData = fs.readFileSync(file.path, 'utf8');
      csv.parse(csvData, { columns: true, trim: true }, async (err, records) => {
        if (err) return res.status(400).json({ error: 'CSV parse error' });
        students = records.map(row => ({
          student_id: row.Student_ID,
          student_name: row.Student_Name,
          total_marks: Number(row.Total_Marks),
          marks_obtained: Number(row.Marks_Obtained),
          percentage: (Number(row.Marks_Obtained) / Number(row.Total_Marks)) * 100,
        }));
        await Student.insertMany(students);
        fs.unlinkSync(file.path);
        res.json({ message: 'Upload successful', count: students.length });
      });
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.originalname.endsWith('.xlsx')) {
      // Parse Excel
      const workbook = xlsx.readFile(file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);
      students = data.map(row => ({
        student_id: row.Student_ID,
        student_name: row.Student_Name,
        total_marks: Number(row.Total_Marks),
        marks_obtained: Number(row.Marks_Obtained),
        percentage: (Number(row.Marks_Obtained) / Number(row.Total_Marks)) * 100,
      }));
      await Student.insertMany(students);
      fs.unlinkSync(file.path);
      res.json({ message: 'Upload successful', count: students.length });
    } else {
      fs.unlinkSync(file.path);
      res.status(400).json({ error: 'Unsupported file type' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all students
app.get('/students', async (req, res) => {
  const students = await Student.find().sort({ created_at: -1 });
  res.json({ students, total: students.length });
});

// Edit a student (update info/grades)
app.put('/students/:id', async (req, res) => {
  try {
    const { student_id, student_name, total_marks, marks_obtained } = req.body;
    const percentage = (Number(marks_obtained) / Number(total_marks)) * 100;
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      { student_id, student_name, total_marks, marks_obtained, percentage },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student updated', student: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Delete a student
app.delete('/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
