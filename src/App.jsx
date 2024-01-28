import React, { useState } from 'react';

const App = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gapDays, setGapDays] = useState('');

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleGapDaysChange = (e) => {
    setGapDays(e.target.value);
  };

  const handleGenerateSchedule = () => {
    // Implement logic to generate schedule based on the selected dates and gap days
    console.log(`Generating schedule from ${startDate} to ${endDate} with a gap of ${gapDays} days`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Automated Datesheet Generator</h1>

      <div style={styles.datePickerContainer}>
        <label style={styles.label} htmlFor="startDatePicker">Select Start Date: </label>
        <input
          type="date"
          id="startDatePicker"
          value={startDate}
          onChange={handleStartDateChange}
          style={styles.input}
        />
      </div>

      <div style={styles.datePickerContainer}>
        <label style={styles.label} htmlFor="endDatePicker">Select End Date: </label>
        <input
          type="date"
          id="endDatePicker"
          value={endDate}
          onChange={handleEndDateChange}
          style={styles.input}
        />
      </div>

      <div style={styles.gapDaysContainer}>
        <label style={styles.label} htmlFor="gapDaysInput">Number of Gap Days: </label>
        <input
          type="number"
          id="gapDaysInput"
          value={gapDays}
          onChange={handleGapDaysChange}
          style={styles.input}
        />
      </div>

      <button style={styles.button} onClick={handleGenerateSchedule}>Generate Schedule</button>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '50px',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    maxWidth: '400px',
    margin: 'auto',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    color: 'purple',
  },
  datePickerContainer: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '16px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  gapDaysContainer: {
    marginBottom: '20px',
  },
  button: {
    backgroundColor: 'purple',
    color: 'white',
    padding: '10px 15px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default App;
