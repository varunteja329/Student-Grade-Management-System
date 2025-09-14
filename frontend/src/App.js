import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Toolbar,
  AppBar,
  Container,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function App() {
  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('https://student-grade-management-backend-1.onrender.com/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message + ` (${res.data.count} records)`);
      setError('');
      setOpen(true);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setMessage('');
      setOpen(true);
    }
  };

  const handleEditOpen = (student) => {
    setEditStudent({ ...student });
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditStudent(null);
  };
  const handleEditChange = (e) => {
    setEditStudent({ ...editStudent, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`https://student-grade-management-backend-1.onrender.com/students/${editStudent._id}`, {
        student_id: editStudent.student_id,
        student_name: editStudent.student_name,
        total_marks: editStudent.total_marks,
        marks_obtained: editStudent.marks_obtained,
      });
      setMessage('Student updated');
      setError('');
      setOpen(true);
      setEditOpen(false);
      fetchStudents();
    } catch {
      setError('Update failed');
      setMessage('');
      setOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await axios.delete(`https://student-grade-management-backend-1.onrender.com/students/${id}`);
      setMessage('Student deleted');
      setError('');
      setOpen(true);
      fetchStudents();
    } catch {
      setError('Delete failed');
      setMessage('');
      setOpen(true);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('https://student-grade-management-backend-1.onrender.com/students');
      setStudents(res.data.students);
      setTotal(res.data.total);
    } catch {
      setStudents([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <>
      {/* Top AppBar */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Student Grade Management by Varun Nimmakuri
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {/* Upload Section */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, textAlign:'center' }}>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            style={{ border: '1px solid #ccc', padding: '6px',textAlign:'center', borderRadius: 6 }}
          />
          <Button variant="contained" color="primary" onClick={handleUpload}>
            Upload
          </Button>
        </Box>

        {/* Stats */}
        <Typography variant="subtitle1" gutterBottom>
          Total Students: <strong>{total}</strong>
        </Typography>

        {/* Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell sx={{ color: 'white' }}>Student ID</TableCell>
                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Total Marks</TableCell>
                <TableCell sx={{ color: 'white' }}>Marks Obtained</TableCell>
                <TableCell sx={{ color: 'white' }}>Percentage</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s._id} hover>
                  <TableCell>{s.student_id}</TableCell>
                  <TableCell>{s.student_name}</TableCell>
                  <TableCell>{s.total_marks}</TableCell>
                  <TableCell>{s.marks_obtained}</TableCell>
                  <TableCell>{s.percentage.toFixed(2)}%</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEditOpen(s)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(s._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
            <TextField label="Student ID" name="student_id" value={editStudent?.student_id || ''} onChange={handleEditChange} fullWidth />
            <TextField label="Name" name="student_name" value={editStudent?.student_name || ''} onChange={handleEditChange} fullWidth />
            <TextField label="Total Marks" name="total_marks" type="number" value={editStudent?.total_marks || ''} onChange={handleEditChange} fullWidth />
            <TextField label="Marks Obtained" name="marks_obtained" type="number" value={editStudent?.marks_obtained || ''} onChange={handleEditChange} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
          {message ? (
            <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
              {message}
            </Alert>
          ) : error ? (
            <Alert onClose={() => setOpen(false)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          ) : null}
        </Snackbar>
      </Container>
    </>
  );
}

export default App;
