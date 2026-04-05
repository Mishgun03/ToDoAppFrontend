# E2E Test Matrix

## Scope

The suite replaces the previous smoke-style checks with 10 deep user journeys that combine authentication, CRUD, detail-page work, filters, search, smart-list behavior, pagination, and route protection.

## Matrix

| ID | Scenario | Preconditions | Key actions | Expected result |
| --- | --- | --- | --- | --- |
| J1 | Replace a deleted note and recover it through filters and search | User can register and log in | Create note A, delete it, create note B, edit note B, mark it completed, filter completed notes, search for it, open detail | Deleted note stays gone, edited note is found again, detail page reflects edited content and completed state |
| J2 | Recover from registration and login mistakes | Registration and login pages available | Trigger client validation errors, register successfully, fail login once, log in correctly, open profile, log out, re-enter, create a note | Validation appears, auth recovery works, route guard redirects when logged out, work continues after re-login |
| J3 | Rename a searched note and find it only by the new title | Logged-in user with empty list | Create three notes, search one, rename it from detail, verify old query fails, verify new query works, delete another note | Search reflects the rename, deleted note disappears, remaining note is reachable from search |
| J4 | Move a note from one priority view to another | Logged-in user | Seed high and low priority notes, open high view, edit one note to low priority, revisit old and new views, search for moved note | Note disappears from old priority filter and becomes discoverable in the new one |
| J5 | Move a note from completed back to active while deleting another | Logged-in user | Create two notes, complete one from dashboard, open completed filter, reopen detail, revert to active, delete second note, search survivor | Status transitions are preserved across dashboard and detail, deleted note stays removed |
| J6 | Finish a smart-list note and confirm it still exists outside the smart list | Logged-in user | Seed urgent, future, and no-deadline notes, open smart list, edit urgent note, complete it, revisit smart list, search for the completed note in all notes | Smart list only shows urgent undone note, then drops it after completion while the note remains in the system |
| J7 | Keep dashboard metadata and detail metadata aligned | Logged-in user | Seed note with deadline, repeat, and priority, inspect dashboard card, inspect detail page, edit title/content/priority, open new priority view | Card and detail stay consistent after edits and priority change |
| J8 | Update a note from page two and remove it after search | Logged-in user | Create one note, add enough notes for pagination, open page two, edit the target note, return to page two, search it, delete it | Pagination remains usable, edited note is found from search, deletion removes it from results |
| J9 | Recover from duplicate registration and wrong-password login | Registration page available | Register user, try duplicate registration, fail login once, log in correctly, create two notes, delete one, search remaining one | Duplicate account is rejected, login recovery works, product flow continues normally |
| J10 | Protect a deep link after logout and restore access later | Logged-in user with one note | Open note detail, capture URL, visit profile, log out, retry deep link, log back in, reopen deep link, edit and delete note | Protected routes redirect when logged out and restore correctly after re-authentication |

## Coverage Map

| Area | Covered by |
| --- | --- |
| Registration validation | J2, J9 |
| Duplicate registration handling | J9 |
| Login error handling | J2, J9 |
| Logout and route protection | J2, J10 |
| Create note | J1, J2, J3, J5, J8, J9, J10 |
| Edit note | J1, J3, J4, J6, J7, J8, J10 |
| Delete note | J1, J3, J5, J8, J9, J10 |
| Complete / reopen note | J1, J5, J6 |
| Search | J1, J2, J3, J4, J5, J6, J8, J9, J10 |
| Status filters | J1, J5 |
| Priority filters | J4, J7 |
| Smart list | J6 |
| Pagination | J8 |
| Profile navigation | J2, J10 |
