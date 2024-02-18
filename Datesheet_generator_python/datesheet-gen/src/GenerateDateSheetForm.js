import axios from 'axios';
import React, { useState } from 'react';

const GenerateDateSheetForm = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    gapDays: '',
    excelFile: null,
    holidayFile: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('start_date', formData.startDate);
    formDataToSend.append('end_date', formData.endDate);
    formDataToSend.append('gap_days', formData.gapDays);
    formDataToSend.append('excel_file', formData.excelFile);
    formDataToSend.append('holiday_file', formData.holidayFile);

    try {
      const response = await axios.post('/generate-datesheet', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
      // Handle success response here
    } catch (error) {
      console.error('Error occurred:', error);
      // Handle error here
    }
  };

  return (
    <div>
      <h2>Generate Date Sheet</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Date:</label>
          <input type="text" name="startDate" value={formData.startDate} onChange={handleInputChange} />
        </div>
        <div>
          <label>End Date:</label>
          <input type="text" name="endDate" value={formData.endDate} onChange={handleInputChange} />
        </div>
        <div>
          <label>Gap Days:</label>
          <input type="text" name="gapDays" value={formData.gapDays} onChange={handleInputChange} />
        </div>
        <div>
          <label>Upload Excel File:</label>
          <input type="file" name="excelFile" onChange={handleFileChange} />
        </div>
        <div>
          <label>Upload Holiday File:</label>
          <input type="file" name="holidayFile" onChange={handleFileChange} />
        </div>
        <button type="submit">Generate Date Sheet</button>
      </form>
    </div>
  );
};

export default GenerateDateSheetForm;
