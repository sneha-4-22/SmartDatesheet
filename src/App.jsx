import React, { useState } from 'react';

const App = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gapDays, setGapDays] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('midterm'); 

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleTermChange = (e) => {
    setSelectedTerm(e.target.value);
    setGapDays(e.target.value === 'midterm' ? '0' : '2');
  };

  const isHoliday = (date) => {
    const holidayList = ['2024-01-01', '2024-07-04'];
    return holidayList.includes(date);
  };
  const isWeekend = (date) => {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 0  || dayOfWeek === 6 ;
  };

  const handleGenerateSchedule = () => {
    if (!startDate || !endDate) {
      alert("Please enter valid dates");
      return;
    }
  
    const gap = parseInt(gapDays);
  
    const scheduleDates = generateScheduleDates(startDate, endDate, gap);
  
    const filteredDates = scheduleDates.filter(date => !isHoliday(date) && !isWeekend(date));
  
    console.log(`Generating ${selectedTerm} schedule from ${startDate} to ${endDate} with a gap of ${gap} days. Schedule dates: `, filteredDates);
  };

  const generateScheduleDates = (start, end, gap) => {
    const scheduleDates = [];
    let currentDate = new Date(start);
  
    while (currentDate <= new Date(end)) {
      scheduleDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + gap);
    }
  
    return scheduleDates;
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
          onChange={(e) => setGapDays(e.target.value)}
          style={styles.input}
          disabled={selectedTerm === 'midterm'} // Enable only if the term is 'endterm'
        />
      </div>

      <div style={styles.termSelector}>
        <label style={styles.label} htmlFor="termSelector">Select Term: </label>
        <select
          id="termSelector"
          value={selectedTerm}
          onChange={handleTermChange}
          style={styles.input}
        >
          <option value="midterm">Mid-Term</option>
          <option value="endterm">End-Term</option>
        </select>
      </div>

      <button style={styles.button} onClick={handleGenerateSchedule}>Generate Schedule</button>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '60px',
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
  termSelector: {
    marginBottom: '20px',
  },
};

export default App;
