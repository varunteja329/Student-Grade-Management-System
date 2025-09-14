# Student Grade Management System - Backend

## Setup

1. Install dependencies:
   ```
npm install
   ```
2. Set up MongoDB Atlas and update the `MONGODB_URI` in your environment or use local MongoDB.
3. Start the server:
   ```
npm run dev
   ```

## API Endpoints
- `POST /upload` (multipart/form-data, field: `file`): Upload Excel/CSV file with student data
- `GET /students`: Get all students with calculated percentage

## File Format
- Columns: Student_ID, Student_Name, Total_Marks, Marks_Obtained

## Example .env
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/student-grades
PORT=5000
```
