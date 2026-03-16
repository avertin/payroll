import { validatePayroll } from "./validatePayroll";

const validRow = {
  employee_name: "Alice",
  employee_id: "1",
  level: "APPRENTICE",
  occupation: "Electrician",
  week_ending: "03/01/2025",
  mon_st_hours: "8",
  tue_st_hours: "8",
  wed_st_hours: "8",
  thu_st_hours: "8",
  fri_st_hours: "8",
  sat_st_hours: "0",
  sun_st_hours: "0",
  mon_ot_hours: "0",
  tue_ot_hours: "0",
  wed_ot_hours: "0",
  thu_ot_hours: "0",
  fri_ot_hours: "0",
  sat_ot_hours: "0",
  sun_ot_hours: "0",
  standard_rate: "25",
  overtime_rate: "37.5",
  benefits_rate: "5",
};

describe("validatePayroll", () => {
  it("returns employees and weeklyWages when row is valid", () => {
    const result = validatePayroll([validRow]);
    expect(result.errors).toHaveLength(0);
    expect(result.employees).toHaveLength(1);
    expect(result.employees[0]).toEqual({
      id: 1,
      name: "Alice",
      occupation: "Electrician",
      level: "APPRENTICE",
    });
    expect(result.weeklyWages).toHaveLength(1);
    expect(result.weeklyWages[0]!.employeeId).toBe(1);
    expect(result.weeklyWages[0]!.monStHours).toBe(8);
    expect(result.weeklyWages[0]!.standardRate).toBe(25);
    expect(result.weeklyWages[0]!.overtimeRate).toBe(37.5);
  });

  it("errors when sum of ST hours > 40", () => {
    const row = {
      ...validRow,
      mon_st_hours: "10",
      tue_st_hours: "10",
      wed_st_hours: "10",
      thu_st_hours: "11",
      fri_st_hours: "10",
    };
    const result = validatePayroll([row]);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]!.message).toMatch(/Sum of standard hours.*<= 40/);
  });

  it("errors when overtime_rate is not 1.5 * standard_rate", () => {
    const row = { ...validRow, overtime_rate: "100" };
    const result = validatePayroll([row]);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]!.message).toMatch(/overtime_rate.*1.5/);
  });

  it("errors when level is invalid", () => {
    const row = { ...validRow, level: "MANAGER" };
    const result = validatePayroll([row]);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]!.message).toMatch(/APPRENTICE or JOURNEYWORKER/);
  });

  it("errors when same employee_id has inconsistent name", () => {
    const row2 = {
      ...validRow,
      week_ending: "03/08/2025",
      employee_name: "Bob",
    };
    const result = validatePayroll([validRow, row2]);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]!.message).toMatch(/inconsistent/);
  });
});
