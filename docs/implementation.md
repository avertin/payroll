# Implementation log

Use this file to record implementation notes, decisions, and progress as you work on the project.

---

## Step 1

Define data model and seed the DB with data from the CSV. Having a clean data model forces fluency and familiarity with the data and good organization.

Table - Employee
name string
id unique, number
occupation string
level = APPRENTICE or JOURNEYWORKER

Validations: All rows have name + employee_id consistent, validate on input

Table - Weekly Wages
id unique, nano
ending data date
employeeId = foreign key to Employee table
monStHours, float
tueStHours, float
...
sunStHours, float
monOtHours, float
...
sunOtHours, float
standardRate, float
overtimeRate, float
benefitsRate, float

Validations: all hours are greater than 0, st hours are less than or equal to 40, overtime rate is 1.5 the standard_rate

Use payroll_data.csv to populate the seed script, for now fail the seed if the validation does not pass. Make validation and formatting of the csv separate helper functions inside a new payroll feature so they can be reused later.

Initial dump of validation:
Payroll validation failed:
Row 3: Sum of standard hours (46.3) must be <= 40
Row 8: Sum of standard hours (46.4) must be <= 40
Row 11: overtime*rate (135.3) must be 1.5 * standard*rate (90.19) = 135.285
Row 14: Sum of standard hours (45.7) must be <= 40
Row 17: Sum of standard hours (46) must be <= 40
Row 19: Sum of standard hours (42.7) must be <= 40
Row 20: Sum of standard hours (41.9) must be <= 40
Row 21: Sum of standard hours (46.3) must be <= 40
Row 22: Sum of standard hours (41.2) must be <= 40
Row 38: Sum of standard hours (41.300000000000004) must be <= 40
Row 40: Sum of standard hours (48.5) must be <= 40
Row 45: Sum of standard hours (42.4) must be <= 40
Row 59: Sum of standard hours (42.9) must be <= 40
Row 66: Sum of standard hours (59.6) must be <= 40
Row 69: Sum of standard hours (43.800000000000004) must be <= 40
Row 70: Sum of standard hours (50.199999999999996) must be <= 40
Row 73: Employee 1022 has inconsistent name/occupation/level across rows (expected name=Harry Botsford, occupation=Sheet Metal Worker, level=JOURNEYWORKER)
Row 74: Sum of standard hours (41.699999999999996) must be <= 40
Row 78: Sum of standard hours (40.8) must be <= 40
Row 80: Sum of standard hours (40.300000000000004) must be <= 40
Row 88: Employee 1020 has inconsistent name/occupation/level across rows (expected name=Roma Kohler, occupation=Ironworker, level=JOURNEYWORKER)
Row 90: Sum of standard hours (42.50000000000001) must be <= 40
Row 98: Sum of standard hours (46.900000000000006) must be <= 40
Row 105: Sum of standard hours (43.5) must be <= 40
Row 108: Employee 1021 has inconsistent name/occupation/level across rows (expected name=Arturo Graham-Monahan, occupation=Pipefitter, level=JOURNEYWORKER)
Row 111: Sum of standard hours (42.7) must be <= 40
Row 112: Sum of standard hours (40.9) must be <= 40
Row 114: Sum of standard hours (43.39999999999999) must be <= 40
Row 136: Sum of standard hours (43.300000000000004) must be <= 40
Row 137: overtime_rate (23.89) must be 1.5 * standard_rate (15.92) = 23.88
Row 151: Sum of standard hours (41.6) must be <= 40
Row 159: Sum of standard hours (43.9) must be <= 40
Row 160: Sum of standard hours (40.800000000000004) must be <= 40
Row 173: Sum of standard hours (44.9) must be <= 40
Row 177: Employee 1014 has inconsistent name/occupation/level across rows (expected name=Luisa Robel, occupation=Carpenter, level=JOURNEYWORKER)
Row 181: Sum of standard hours (43.1) must be <= 40
Row 191: Sum of standard hours (41.7) must be <= 40
Row 215: Sum of standard hours (43.6) must be <= 40
Row 236: Employee 1017 has inconsistent name/occupation/level across rows (expected name=Eda Rogahn, occupation=Carpenter, level=JOURNEYWORKER)
Row 242: Sum of standard hours (45.49999999999999) must be <= 40
Row 247: Sum of standard hours (41.800000000000004) must be <= 40
Row 251: Sum of standard hours (41.9) must be <= 40
Row 252: Sum of standard hours (44.99999999999999) must be <= 40
Row 258: overtime_rate (98.92) must be 1.5 \* standard_rate (65.94) = 98.91
Row 265: Sum of standard hours (44.1) must be <= 40
Row 268: Sum of standard hours (40.6) must be <= 40
Row 274: Sum of standard hours (48.5) must be <= 40

Add boolean to keep validations for now but bypass the logic during seed

## Step 2

API & presentation layer.

## Step 3

File upload + validation

## Notes

(Add your implementation notes here.)
