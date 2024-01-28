from datetime import datetime, timedelta

def generate_date_sheet(course_registrations, start_date, gap_between_exams):
    sorted_courses = sorted(course_registrations.items(), key=lambda x: x[1], reverse=True)

    is_even_semester = start_date.month % 2 == 0

    exam_date = start_date

    date_sheet = {}

    for i, (course, registrations) in enumerate(sorted_courses, start=1):
        session = "Morning" if is_even_semester else "Evening"

        end_date = exam_date + timedelta(days=(gap_between_exams * i))

        date_sheet[course] = {
            "Exam Date": exam_date.strftime("%Y-%m-%d") + f" {session}",
            "End Date": end_date.strftime("%Y-%m-%d") + f" {session}",
        }

        exam_date = end_date + timedelta(days=1)

    return date_sheet

course_registrations = {1: 100, 2: 80, 3: 120, 4: 90}
start_date = datetime(2024, 2, 1)
gap_between_exams = 2
date_sheet = generate_date_sheet(course_registrations, start_date, gap_between_exams)


for course, details in date_sheet.items():
    print(f"Course {course}: {details['Exam Date']} - {details['End Date']}")
