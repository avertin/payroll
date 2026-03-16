import { parsePayrollCsv } from "./parsePayrollCsv";

describe("parsePayrollCsv", () => {
  it("parses CSV with headers into row objects", () => {
    const csv = `employee_name,employee_id,level,occupation,week_ending,mon_st_hours,tue_st_hours,wed_st_hours,thu_st_hours,fri_st_hours,sat_st_hours,sun_st_hours,mon_ot_hours,tue_ot_hours,wed_ot_hours,thu_ot_hours,fri_ot_hours,sat_ot_hours,sun_ot_hours,standard_rate,overtime_rate,benefits_rate
Alice,1,APPRENTICE,Electrician,03/01/2025,8,8,8,8,8,0,0,0,0,0,0,0,0,0,25,37.5,5`;
    const rows = parsePayrollCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]!["employee_name"]).toBe("Alice");
    expect(rows[0]!["employee_id"]).toBe("1");
    expect(rows[0]!["level"]).toBe("APPRENTICE");
    expect(rows[0]!["standard_rate"]).toBe("25");
  });

  it("returns empty array for header-only CSV", () => {
    const csv = `employee_name,employee_id,level,occupation,week_ending
`;
    const rows = parsePayrollCsv(csv);
    expect(rows).toHaveLength(0);
  });
});
