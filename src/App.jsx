
import React, { useState } from 'react';

const App = () => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleGenerateSchedule = () => {
    console.log(`Generating schedule for ${selectedDate}`);
  };

  return (
    <div>
      <h1>Automated Datesheet Generator</h1>
      <label htmlFor="datePicker">Select Date: </label>
      <input
        type="date"
        id="datePicker"
        value={selectedDate}
        onChange={handleDateChange}
      />
      <button onClick={handleGenerateSchedule}>Generate Schedule</button>
    </div>
  );
};

export default App;
