import React, { useState } from 'react';
import { FileDrop } from 'react-file-drop';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    let currentSemester = '';
    
    json.forEach((row, rowIndex) => {
        console.log('Row:', row);
        
        // Skip irrelevant rows
        if (!row || row.length === 0 || row.length === 1) {
            console.log('Skipping row:', row);
            return;
        }
        
        // Check if the row contains a semester header
        if (typeof row === 'string' && row.startsWith('SEMESTER-')) {
            console.log('Found semester header:', row);
            currentSemester = row;
        } else if (Array.isArray(row) && row.length >= 2 && row[0] && row[1]) {
            const subjectCode = row[0];
            const subjectName = row[1];
            let date = '';
            if (row.length > 2) {
                date = row[2];
            } else {
                // Generate exam dates if not provided in the Excel sheet
                const examDates = generateExamDates(startDate, 1); // Generate 1 exam date
                if (examDates.length > 0) {
                    date = examDates[0].toLocaleDateString(); // Get the date in string format
                }
            }
            
            // Check if the subject code is not 'SUBJECT CODES' and if date is valid
            if (subjectCode !== 'SUBJECT CODES' && subjectName !== 'SUBJECT NAME') {
                console.log('Adding row to modified data:', row);
                modifiedData.push({ semester: currentSemester, subjectCode, subjectName, date });
            } else {
                console.log('Skipping row:', row);
            }
        } else {
            console.log('Skipping row:', row);
        }
    });
    
    console.log('Modified Data:', modifiedData);
    return modifiedData;
};


// Integration in your code
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
      
        // Manipulate the Excel data and generate the schedule
        const modifiedData = manipulateExcelData(json, startDate);
        console.log('Modified Data:', modifiedData); // Log the modifiedData array
        setSchedule(modifiedData);
        generateExcel(modifiedData);
    };
    reader.readAsArrayBuffer(file);
};







  const generateExcel = (data) => {
    // Create a new worksheet
    const ws = XLSX.utils.aoa_to_sheet([
      ['Semester', 'Subject Code', 'Subject Name', 'Date']
    ]);
  
    // Iterate through the data and populate the worksheet
    let rowIndex = 1; // Start from row 1 to skip headers
    data.forEach(item => {
      const { semester, subjectCode, subjectName, date } = item;
      XLSX.utils.sheet_add_aoa(ws, [[semester, subjectCode, subjectName, date]], {origin: `A${rowIndex}`});
      rowIndex++;
    });
  
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modified Schedule");
  
    // Convert the workbook to a binary string
    const wbout = XLSX.write(wb, { type: 'binary' });
  
    // Convert binary string to Blob
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  
    // Create download link
    const url = URL.createObjectURL(blob);
  
    // Create anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_schedule.xlsx';
    a.click();
  
    // Release the object URL
    URL.revokeObjectURL(url);
  };

  // Utility function to convert string to array buffer
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

const generateExamDates = (startDate, numExams) => {
  const examDates = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < numExams; i++) {
    // Skip Sundays and even Saturdays
    while (currentDate.getDay() === 0 || currentDate.getDay() % 2 === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    examDates.push(new Date(currentDate)); // Store a copy of the date
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }
  
  return examDates;
};



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
