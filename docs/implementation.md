# Payroll Dashboard — Implementation Notes

This document explains how the take-home assignment was approached and what was built. The work was completed within the 3-hour time limit.

---

## What I Built (mapped to the assignment)

### 1. Summary statistics

- Unique employee count
- Min, max, and average for standard rate, overtime rate, and benefits rate
- Cumulative payroll spend (standard + overtime wages + benefits)
- Percentage of total hours attributable to apprentices
- Total hours on project

All values are computed in a single GET API so the UI and any future consumers share one source of truth. Keep these aggregates out of the database since they aren't expensive to compute.Take a backend for frontend approach with the api since there are no consumers of the API outside of this application. If needed, caching can be added later for these computations.

### 2. Employee statistical overviews

The **By Employee** view focuses on per-employee metrics:

- **Table:** Total pay, total hours, average weekly hours, max/min single-week hours, % overtime, number of weeks worked, and a **rate variance** flag (see Anomaly detection). Rows are expandable to drill into weekly detail.

Wage rate min/max/avg (standard, overtime, benefits) are shown on the All view so both views stay focused and comparable.

### 3. Anomaly detection

- **Data cleanliness**: The focus in on cleaning clear and obvious issues with the data before it even has a chance to enter the system. Robust validation is added on csv upload. See UI for specific validation criteria.
- **Rate variance:** For each employee, the system flags whether their standard, overtime, or benefits rate changed across any two weeks. That can indicate data entry errors or legitimate changes (e.g. raises). The By Employee table shows this as a column, and the summary card shows how many employees have at least one rate change.
- This gives the project manager a concrete, explainable signal to review. Other anomaly logic (e.g. “suspiciously high/low” wages or hours) would require some additional, more granular UI views into the week by week, and even day by day activity. Intentionally chose to stay high level until establishing clearer rules or thresholds from the business (see _Questions for a production manager_, below).

### 4. Stretch / extras

- **Database and backend:** Prisma schema (Employee + WeeklyWages), SQLite. CSV parsing and validation live in the payroll feature and are reused everywhere (see below).
- **File upload:** The primary way to load data is the **Upload payroll** flow (`/payroll/upload`). Drag-and-drop accepts a single CSV; the same validation used in the codebase runs on upload. If any row fails, the API returns 400 with error details and no rows are inserted (unless intentional skip invalid rows flag is set in the UI); on success it returns 200 with the number of rows added. A seed script exists for local development only; in a final implementation the upload UI replaces the need for seeding.
- **Validation rules:** Headers must match expected columns; employee_id and types validated; same employee_id must have consistent name, occupation, and level; week_ending valid date; hours non-negative; standard hours ≤ 8 per day and sum per week ≤ 40; standard + OT per day ≤ 24; overtime_rate = 1.5 × standard_rate (within rounding); no duplicate (employee_id, week_ending).
- **Tests:** Unit tests for report aggregation and for validation logic.

---

## Approach and prioritization

- **Data model first:** Defined Employee and WeeklyWages and shared validation so the rest of the app could assume clean data and one place to change rules.
- **Reuse:** CSV parsing and validation are shared between the seed script and the upload endpoint so behavior is consistent and testable.
- **Incremental scope:** Implemented summary stats and the main table, then the By Employee view and rate-variance flagging, then upload and the extra validation rules.

---

## Validation and correctness

Grand totals (unique employees, total pay, % apprentice hours, min/max/avg rates) were cross-checked against a separate tool (Tableau) to confirm the aggregates.

---

## Questions for a production manager / next steps

To turn this into a more valuable product, I’d want to:

1. **Review validations with a production manager.** Have them review the current rules (standard hours ≤ 40, OT = 1.5× standard, duplicate rows, etc.) and confirm what should be hard errors vs. warnings, and whether any rules are missing.
2. **Define “suspicious” for wages and hours.** Understand how to detect anomalies such as:
   - Way too low or way too high wage (e.g. vs. role, vs. employee history, or vs. prevailing wage)
   - Way too many or way too few hours in a week or on a single day  
     Thresholds or rules could then be implemented and surfaced in the UI.
3. **Understand useful granularity.** Learn what level of detail they actually use (e.g. week vs. day, by trade vs. by level) so the dashboards align with their workflows.
4. **Treat this as a proof of concept and do user research.** Run short user interviews: watch people complete real tasks with the tool, identify their jobs-to-be-done, and map the questions the tool answers (and the metrics it shows) directly to those workflows. Then refine the UI and anomaly signals based on that.

---

## Given more time (technical)

- **Anomalies:** Row-level flags for suspicious wages/hours once thresholds or rules are defined; drill-down from rate variance into the specific weeks and rates that changed.
- **Data quality:** Stricter occupation consistency (e.g. for prevailing-wage lookups); optional column mapping for CSV uploads; streaming for very large files.
- **UX:** Correct mistakes on upload or after (e.g. edit/correct rows); richer visualizations to spot anomalies; optional AI-assisted anomaly detection.
