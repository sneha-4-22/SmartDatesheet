from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import pandas as pd
import numpy as np
import xlsxwriter
import sqlite3

app = Flask(__name__)

# Define the directory to store uploaded files
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Define the allowed file extensions
ALLOWED_EXTENSIONS = {'xlsx'}

# Check if the uploaded file has an allowed extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Connect to SQLite database
conn = sqlite3.connect('datesheet.db')
cursor = conn.cursor()

# Create table to store datesheet data if not exists
cursor.execute('''CREATE TABLE IF NOT EXISTS datesheet (
                S_no INTEGER PRIMARY KEY,
                Subject_codes TEXT,
                Subject_name TEXT,
                Course_nature TEXT,
                Exam_type TEXT,
                Date DATE,
                Time_slot TEXT
                )''')
conn.commit()

@app.route('/generate-datesheet', methods=['POST'])
def generate_datesheet():
    # Parse input data from request
    start_date = request.form['start_date']
    end_date = request.form['end_date']
    gap_days = int(request.form['gap_days'])  # Parse the number of gap days
    exam_type = request.form['exam_type']  # Parse exam type (Mid term or End term)

    # Check if the files are included in the request
    if 'excel_file' not in request.files or 'holiday_file' not in request.files:
        return jsonify({'error': 'Excel file and holiday file are required'}), 400

    excel_file = request.files['excel_file']
    holiday_file = request.files['holiday_file']

    # Check if the files have valid extensions
    if excel_file.filename == '' or holiday_file.filename == '':
        return jsonify({'error': 'No selected files'}), 400

    if not allowed_file(excel_file.filename) or not allowed_file(holiday_file.filename):
        return jsonify({'error': 'Invalid file format. Only Excel files are allowed'}), 400

    # Save the uploaded files to the server
    excel_filename = secure_filename(excel_file.filename)
    holiday_filename = secure_filename(holiday_file.filename)
    excel_path = os.path.join(app.config['UPLOAD_FOLDER'], excel_filename)
    holiday_path = os.path.join(app.config['UPLOAD_FOLDER'], holiday_filename)
    excel_file.save(excel_path)
    holiday_file.save(holiday_path)

    # Read Excel files into DataFrames
    df = pd.read_excel(excel_path)
    holiday_df = pd.read_excel(holiday_path)

    # Perform datesheet generation
    df2 = pd.DataFrame()
    df2["S.no."] = df["S No"]
    df2["SUBJECT CODES"] = df["SUBJECT CODES"]
    df2["SUBJECT NAME"] = df["SUBJECT NAME"]
    df2["Course Nature"] = df["*COURSE NATURE (Hard/Soft/\n Workshop/ NTCC)"]
    df2["Exam Type"] = exam_type  # Add exam type column

    # Convert holiday dates to datetime format
    holiday_df['Date '] = pd.to_datetime(holiday_df['Date '], format='%d-%b - %Y')

    # Generate date range excluding weekends with gap days
    date_range = pd.date_range(start=start_date, end=end_date, freq=f'{gap_days + 1}D')
    weekdays_range = date_range[date_range.dayofweek < 5]

    # Define time slots based on exam type
    if exam_type == "Mid term":
        morning_slot = "9:00 - 10:30"
        evening_slot = "13:00 - 14:30"
    elif exam_type == "End term":
        morning_slot = "9:00 - 12:00"
        evening_slot = "13:00 - 16:00"

    # Iterate over the DataFrame and fill the 'Date' and 'Time Slot' columns
    date_index = 0
    for i, row in df2.iterrows():
        if pd.isna(row["SUBJECT NAME"]):
            df2.at[i, 'Date'] = np.nan
            df2.at[i, 'Time Slot'] = np.nan
            date_index = 0
        else:
            while True:
                if date_index >= len(weekdays_range):
                    df2.at[i, 'Date'] = np.nan
                    df2.at[i, 'Time Slot'] = np.nan
                    break
                elif weekdays_range[date_index].dayofweek < 5 and weekdays_range[date_index] not in holiday_df['Date '].values:
                    df2.at[i, 'Date'] = weekdays_range[date_index]
                    if i % 2 == 0:  # Assign time slots alternately
                        df2.at[i, 'Time Slot'] = morning_slot
                    else:
                        df2.at[i, 'Time Slot'] = evening_slot
                    date_index += 1
                    break
                else:
                    date_index += 1

    # Save the generated datesheet to SQLite database
    df2.to_sql('datesheet', conn, if_exists='replace', index=False)

    # Return the path to the generated Excel sheet
    output_excel_path = os.path.join(app.config['UPLOAD_FOLDER'], 'output_data.xlsx')

    # Write the DataFrame data to an Excel sheet with adjusted column width
    with pd.ExcelWriter(output_excel_path, engine='xlsxwriter') as writer:
        df2.to_excel(writer, index=False)
        worksheet = writer.sheets['Sheet1']
        worksheet.set_column('E:E', 15)

    return jsonify({'excel_sheet_url': output_excel_path})

if __name__ == '__main__':
    app.run(debug=True)
