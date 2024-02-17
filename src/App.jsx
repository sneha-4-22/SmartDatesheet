import React, { useState } from 'react';
import { FileDrop } from 'react-file-drop';
import * as XLSX from 'xlsx';
const App = () => {
  const [file, setFile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gapDays, setGapDays] = useState('');
  const handleFileDrop = (files, event) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);
  };
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const handleGapDaysChange = (e) => {
    setGapDays(e.target.value);
  };
  const manipulateExcelData = (json, startDate) => {
    const modifiedData = [];
    let currentDate = new Date(startDate);
    let currentSemester = '';
    json.forEach((row, rowIndex) => {
      if (typeof row === 'string' && row.startsWith('SEMESTER-')) {
        currentSemester = row;
        currentDate = new Date(startDate); 
      } else if (Array.isArray(row) && row.length >= 2 && row[0] && row[1]) {
        const subjectCode = row[0];
        const subjectName = row[1];
        if (subjectCode === 'SUBJECT CODES' && subjectName === 'SUBJECT NAME') {
          currentDate = new Date(startDate);
          return;
        }
        const formattedDate = currentDate.toLocaleDateString();
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
  
        modifiedData.push({ date: formattedDate, subjectCode, subjectName, semester: currentSemester });
        currentDate.setDate(currentDate.getDate() + 1); 
      }
    });
  
    return modifiedData;
  };
  
  
 

const handleGenerateSchedule = () => {
    if (!file) {
        alert("Please upload an Excel file");
        return;
    }
    if (!startDate || !endDate || !gapDays) {
        alert("Please enter valid start date, end date, and gap days");
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const modifiedData = manipulateExcelData(json, startDate);
        console.log('Modified Data:', modifiedData); 
        setSchedule(modifiedData);
        generateExcel(modifiedData);
    };
    reader.readAsArrayBuffer(file);
};
  const generateExcel = (data) => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Semester', 'Subject Code', 'Subject Name', 'Date']
    ]);
    let rowIndex = 1; 
    data.forEach(item => {
      const { semester, subjectCode, subjectName, date } = item;
      XLSX.utils.sheet_add_aoa(ws, [[semester, subjectCode, subjectName, date]], {origin: `A${rowIndex}`});
      rowIndex++;
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modified Schedule");
    const wbout = XLSX.write(wb, { type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_schedule.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };
  const isValidDate = (dateString) => {
    const dateObject = new Date(dateString);
    const isValid = !isNaN(dateObject.getTime());
    console.log('Date:', dateString, 'isValid:', isValid);
    return isValid;
};
// const generateExamDates = (startDate, numExams) => {
//   const examDates = [];
//   let currentDate = new Date(startDate);
//   let daysToAdd = 1; 
//   for (let i = 0; i < numExams; i++) {
//     while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
//       currentDate.setDate(currentDate.getDate() + 1); 
//     }
//     examDates.push(new Date(currentDate));
//     currentDate.setDate(currentDate.getDate() + daysToAdd);
//   }
//   return examDates;
// };

  return (
    <div style={styles.container}>
      <h1>Automated Datesheet Generator</h1>

      <FileDrop onDrop={handleFileDrop} style={styles.fileDropZone}>
        <div style={styles.dropZoneContent}>
          <p>Drop Excel File Here</p>
        </div>
      </FileDrop>
      
      {file && <span>{file.name}</span>}

      <div>
        <label htmlFor="startDatePicker">Start Date:</label>
        <input
          type="date"
          id="startDatePicker"
          value={startDate}
          onChange={handleStartDateChange}
        />
      </div>

      <div>
        <label htmlFor="endDatePicker">End Date:</label>
        <input
          type="date"
          id="endDatePicker"
          value={endDate}
          onChange={handleEndDateChange}
        />
      </div>

      <div>
        <label htmlFor="gapDaysInput">Gap Days:</label>
        <input
          type="number"
          id="gapDaysInput"
          value={gapDays}
          onChange={handleGapDaysChange}
        />
      </div>

      <button onClick={handleGenerateSchedule} style={styles.button}>Generate Schedule</button>

      <div>
        <h2>Schedule:</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Semester</th>
            </tr>
          </thead>
          <tbody>
    {schedule.map((entry, index) => (
        <tr key={index}>
            <td>{entry.date}</td>
            <td>{entry.subjectCode}</td>
            <td>{entry.subjectName}</td>
            <td>{entry.semester}</td>
        </tr>
    ))}
</tbody>

        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    maxWidth: '400px',
    margin: 'auto',
  },
  fileDropZone: {
    width: '100%',
    height: '200px',
    border: '2px dashed #aaa',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  dropZoneContent: {
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'purple',
    color: 'white',
    padding: '10px 15px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default App;
