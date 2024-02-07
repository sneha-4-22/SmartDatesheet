import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const App = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gapDays, setGapDays] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('midterm');
  const [schedule, setSchedule] = useState([]);
  const scheduleRef = useRef(null);
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
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const generateScheduleDates = (start, end, gap) => {
    const scheduleDates = [];
    
    gap = parseInt(gap);
    if (isNaN(gap) || gap <= 0) {
      console.error('Invalid gap value');
      return scheduleDates;
    }
  
    let currentDate = new Date(start);
  
    if (!(currentDate instanceof Date && !isNaN(currentDate))) {
      console.error('Invalid start date');
      return scheduleDates;
    }
    const endDate = new Date(end);
    if (!(endDate instanceof Date && !isNaN(endDate))) {
      console.error('Invalid end date');
      return scheduleDates;
    }
  
    while (currentDate <= endDate) {
      scheduleDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + gap);
    }
  
    return scheduleDates;
  };
  
  const generateSubjects = (term) => {
    return term === 'midterm'
      ? ['LWH128B', 'LWH129B', 'LWH130B', 'LWH131B', 'LWH132B', 'LWH133B','CDO106']
      : ['LWH128B', 'LWH129B', 'LWH130B', 'LWH131B', 'LWH132B', 'LWH133B','CDO106'];
  };

 
  const handleGenerateSchedule = () => {
    if (!startDate || !endDate) {
      alert("Please enter valid dates");
      return;
    }
  
    if (selectedTerm === 'midterm' && gapDays === '0') {
      const subjects = generateSubjects(selectedTerm);
      const scheduleDates = [startDate, endDate]; // Only two dates for midterm with no gap
      const generatedSchedule = scheduleDates.map((date, index) => ({
        date,
        subject: subjects[index % subjects.length]
      }));
      setSchedule(generatedSchedule);
      console.log(`Generating ${selectedTerm} schedule from ${startDate} to ${endDate} with no gap. Schedule dates: `, generatedSchedule);
      generatePDF();
    } else {
      const gap = parseInt(gapDays);
      const scheduleDates = generateScheduleDates(startDate, endDate, gap);
      const filteredDates = scheduleDates.filter(date => !isHoliday(date) && !isWeekend(date));
      const subjects = generateSubjects(selectedTerm);
      const generatedSchedule = filteredDates.map((date, index) => ({
        date,
        subject: subjects[index % subjects.length]
      }));
      setSchedule(generatedSchedule);
      console.log(`Generating ${selectedTerm} schedule from ${startDate} to ${endDate} with a gap of ${gap} days. Schedule dates: `, generatedSchedule);
      generatePDF();
    }
  };
  
  const generatePDF = () => {
    const doc = new jsPDF();
    const scheduleTable = scheduleRef.current;
    const { width, height } = scheduleTable.getBoundingClientRect();
  
    html2canvas(scheduleTable)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; 
        const imgHeight = (height * imgWidth) / width; 
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        doc.save('datesheet.pdf');
      });
  };
  const subjectNames = {
    'LWH128B': 'Legal Methods',
    'LWH129B': 'Law of Contract - II',
    'LWH130B': 'Political Science - II',
    'LWH131B': 'Sociology - II',
    'LWH132B': 'Economics - II',
    'LWH133B': 'Legal English - II',
    'CDO106': 'Professional Communication Law - II'
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
          disabled={selectedTerm === 'midterm'} 
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

      <div ref={scheduleRef}>
        <h2>Schedule:</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.subject}</td>
                
                <td>{subjectNames[entry.subject]}</td>
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
    marginRight: '10px',
  },
  termSelector: {
    marginBottom: '20px',
  },
};

export default App;
