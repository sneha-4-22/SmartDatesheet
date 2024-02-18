import axios from 'axios';
import React, { useState } from 'react';

function App() {
  // State variables to store form data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gapDays, setGapDays] = useState('');
  const [excelFile, setExcelFile] = useState(null);
  const [holidayFile, setHolidayFile] = useState(null);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('gap_days', gapDays);
    formData.append('excel_file', excelFile);
    formData.append('holiday_file', holidayFile);

    try {
      // Make POST request to Flask backend
      const response = await axios.post('/generate-datesheet', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Handle response
      console.log('Excel sheet generated:', response.data);
    } catch (error) {
      console.error('Error generating Excel sheet:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Datesheet Generator</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label htmlFor="start_date">Start Date:</label>
          <input type="date" id="start_date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <br />
          <label htmlFor="end_date">End Date:</label>
          <input type="date" id="end_date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          <br />
          <label htmlFor="gap_days">Gap Days:</label>
          <input type="number" id="gap_days" value={gapDays} onChange={(e) => setGapDays(e.target.value)} required />
          <br />
          <label htmlFor="excel_file">Excel File:</label>
          <input type="file" id="excel_file" onChange={(e) => setExcelFile(e.target.files[0])} required />
          <br />
          <label htmlFor="holiday_file">Holiday File:</label>
          <input type="file" id="holiday_file" onChange={(e) => setHolidayFile(e.target.files[0])} required />
          <br />
          <button type="submit">Generate Datesheet</button>
        </form>
      </main>
    </div>
  );
}

export default App;
