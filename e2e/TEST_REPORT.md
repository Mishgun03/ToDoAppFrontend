# E2E Test Report

## Status

- Execution status: Not executed
- Reason: Prepared by code change only, per user instruction not to run the project
- Suite size: 10 deep Playwright scenarios
- Test file: `ToDoAppFrontend/e2e/user-journeys.spec.ts`

## Scenario Status

| ID | Scenario | Status |
| --- | --- | --- |
| J1 | Replace a deleted note and recover the new one | Prepared, not run |
| J2 | Recover from registration and login mistakes, then continue working | Prepared, not run |
| J3 | Rename a searched note and recover it only by the new name | Prepared, not run |
| J4 | Move a note between priority views and find it in the new one | Prepared, not run |
| J5 | Move a note from completed back to active while deleting another note | Prepared, not run |
| J6 | Work through the smart list and confirm the note survives outside it | Prepared, not run |
| J7 | Keep dashboard metadata and detail metadata consistent | Prepared, not run |
| J8 | Update a note from page two and remove it after searching | Prepared, not run |
| J9 | Recover from duplicate registration and bad-password login | Prepared, not run |
| J10 | Upload files on create, add another file on edit, and verify attachment surfaces | Prepared, not run |

## Coverage Summary

- Authentication: register, login, invalid login, duplicate registration, logout
- Dashboard: create, search, status filters, priority filters, pagination, empty states
- Note lifecycle: create, edit, delete, complete, reopen, detail-page verification
- Cross-view consistency: dashboard to detail, smart list to full list, attachment visibility across views

## Static Risks And Assumptions

- Sorting was intentionally excluded because the current frontend does not expose a user-facing sort control.
- Smart-list scenarios use the application's existing urgent-note behavior: unfinished notes due today or earlier.
- Some scenarios rely on API seeding for metadata-heavy setup, pagination setup, or smart-list deadlines so the journeys can stay deep without inventing unsupported UI behavior.
- The suite was not runtime-validated, so selector-level issues can still exist until you choose to execute it.

## Deliverables

- Scenario document: `ToDoAppFrontend/e2e/SCENARIOS.md`
- Matrix: `ToDoAppFrontend/e2e/TEST_MATRIX.md`
- Playwright suite: `ToDoAppFrontend/e2e/user-journeys.spec.ts`
