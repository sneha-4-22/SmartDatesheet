import streamlit as st
import pandas as pd
import numpy as np
from io import BytesIO

def manipulate_excel(df1, psc_stu, term_type, off_days_list, start_date, end_date, time_slots, gap_days):
    date_range = pd.date_range(start=start_date, end=end_date)
    weekdays_range = date_range[date_range.dayofweek < 5]

    if term_type == "Mid Term":
        gap_between_days = gap_days
    elif term_type == "End Term":
        gap_between_days = gap_days + 1
    else:
        st.error("Invalid term type")

    semester_mapping = {
        "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
        "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10
    }

    date_index = 0
    prev_program_semester = None
    last_date = {}

    for i, row in df1.iterrows():
        if pd.isna(row["Course Name"]):
            df1.at[i, 'Date'] = np.nan
            df1.at[i, 'Time Slot'] = np.nan
            date_index = 0
        else:
            program_semester = (row["Program"], semester_mapping.get(row["Semester"], None))

            if program_semester[1] is not None:
                if program_semester != prev_program_semester:
                    date_index = 0
                    prev_program_semester = program_semester
                    semester_index = program_semester[1] - 1
                    time_slot_index = semester_index % len(time_slots)

                if program_semester in last_date:
                    last_assigned_date = last_date[program_semester] + pd.Timedelta(days=gap_between_days)
                else:
                    last_assigned_date = pd.Timestamp(weekdays_range[0])

                while True:
                    if date_index >= len(weekdays_range):
                        df1.at[i, 'Date'] = np.nan
                        df1.at[i, 'Time Slot'] = np.nan
                        break
                    elif weekdays_range[date_index].dayofweek < 5:
                        current_date = pd.Timestamp(weekdays_range[date_index].date())
                        if current_date >= last_assigned_date and current_date not in off_days_list:
                            df1.at[i, 'Date'] = current_date.strftime('%Y-%m-%d')
                            last_date[program_semester] = current_date
                            df1.at[i, 'Time Slot'] = time_slots[time_slot_index]
                            time_slot_index = (time_slot_index + 1) % len(time_slots)
                            date_index += 1
                            break
                        else:
                            date_index += 1
                    else:
                        date_index += 1

    return df1

def main():
    st.title("Datesheet Generator App")

    sem_data = st.file_uploader("Upload Semester Data (Excel)", type=["xlsx"])
    psc_data = st.file_uploader("Upload PSC Data (Excel)", type=["xlsx"])
    gap_days = st.number_input("Enter Gap Days", min_value=0, value=1)
    start_date = st.date_input("Enter Start Date")
    end_date = st.date_input("Enter End Date")
    off_days = st.text_input("Enter Off Days (comma-separated dates in YYYY-MM-DD format)")

    if sem_data and psc_data and start_date and end_date:
        try:
            df1 = pd.read_excel(sem_data)
            psc_stu = pd.read_excel(psc_data)
            off_days_list = [pd.to_datetime(date.strip()) for date in off_days.split(",") if date.strip()]
            term_type = st.radio("Select Term Type:", ("Mid Term", "End Term"))

            if term_type == "Mid Term":
                time_slots = st.text_input("Enter Time Slots (comma-separated)", "9:00 - 10:30, 11:30 - 13:00, 14:00 - 15:30")
            elif term_type == "End Term":
                time_slots = st.text_input("Enter Time Slots (comma-separated)", "9:00 - 12:30, 13:00 - 15:30")
            
            time_slots = [slot.strip() for slot in time_slots.split(",")]

            if st.button("Generate Datesheet"):
                manipulated_df = manipulate_excel(df1, psc_stu, term_type, off_days_list, start_date, end_date, time_slots, gap_days)
                st.write("Datesheet:")
                st.write(manipulated_df)
                output_excel = BytesIO()
                with pd.ExcelWriter(output_excel, engine='xlsxwriter') as writer:
                    manipulated_df.to_excel(writer, index=False)
                output_excel.seek(0)
                st.download_button(label="Download Datesheet", data=output_excel,
                                   file_name="Datesheet.xlsx", mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()
