import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const App = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gapDays, setGapDays] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('midterm');
  const [schedule, setSchedule] = useState([]);
  const scheduleRef = useRef();

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

  const handleGenerateSchedule = () => {
    if (!startDate || !endDate) {
      alert("Please enter valid dates");
      return;
    }

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
  };

  useEffect(() => {
    // Update the schedule table when the schedule state changes
    if (scheduleRef.current) {
      scheduleRef.current.innerHTML = ''; // Clear the table
      schedule.forEach(entry => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        dateCell.textContent = entry.date;
        const subjectCodeCell = document.createElement('td');
        subjectCodeCell.textContent = entry.subject;
        const subjectNameCell = document.createElement('td');
        subjectNameCell.textContent = entry.subject === 'CDO106' ? 'Professional Communication Law - II' : 'Subject Name';
        row.appendChild(dateCell);
        row.appendChild(subjectCodeCell);
        row.appendChild(subjectNameCell);
        scheduleRef.current.appendChild(row);
      });
    }
  }, [schedule]);

  const generateScheduleDates = (start, end, gap) => {
    const scheduleDates = [];
    let currentDate = new Date(start);

    while (currentDate <= new Date(end)) {
      scheduleDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + gap);
    }

    return scheduleDates;
  };

  const generateSubjects = (term) => {
    return term === 'midterm'
      ? ['LWH128B', 'LWH129B', 'LWH130B', 'LWH131B', 'LWH132B', 'LWH133B']
      : ['CDO106'];
  };

  const handleDownloadPDF = () => {
    const input = scheduleRef.current;
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 0, 0);
        pdf.save('datesheet.pdf');
      });
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

      <button style={styles.button} onClick={handleDownloadPDF}>Download PDF</button>

      <div>
        <h2>Schedule:</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
            </tr>
          </thead>
          <tbody ref={scheduleRef}></tbody>
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
