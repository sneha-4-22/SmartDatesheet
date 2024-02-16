import pandas as pd

# Assuming your Excel file is named 'input.xlsx' and contains data in the first column of the first sheet
excel_file = 'BBA & MBA PROGRAM STRUCTURE EVEN SEMESTER 2024 (2).xlsx'

# Read the Excel file into a DataFrame
df = pd.read_excel(excel_file)

# Extract the values from the first column of the DataFrame
my_list = df.iloc[:, 0].tolist()

# Print the list of items
print("Your list of items:")
for index, item in enumerate(my_list, start=1):
    print(f"{index}. {item}")