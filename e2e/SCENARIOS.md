# Deep E2E Scenarios

## J1. Replace a deleted note and recover the new one

1. The user logs in and lands on an empty dashboard.
2. The user creates a temporary note.
3. The user deletes that note and confirms it disappears completely.
4. The user creates a second note that replaces the deleted one.
5. The user edits the second note's title and description.
6. The user marks the edited note as completed.
7. The user switches to the completed filter and confirms the note is still present there.
8. The user searches for the edited note by part of its new title.
9. The user opens the detail page and confirms the edited content and completed status are preserved.

## J2. Recover from registration and login mistakes, then continue working

1. The user opens registration and submits invalid email and password data.
2. The user confirms the client-side validation messages are shown.
3. The user corrects the form and completes registration successfully.
4. The user tries to log in with the wrong password and gets an authentication error.
5. The user logs in successfully with the correct password.
6. The user opens the profile page and verifies the account identity is shown.
7. The user logs out and is blocked from revisiting the dashboard directly.
8. The user logs in again, creates a note, searches for it, and opens its detail page.

## J3. Rename a searched note and recover it only by the new name

1. The user logs in and creates three different notes.
2. The user searches for one specific note by part of its title.
3. The user confirms the searched note is visible while unrelated notes disappear from the filtered list.
4. The user opens the searched note in detail view.
5. The user edits the title and description so the old query no longer matches.
6. The user returns to the dashboard and repeats the old search query.
7. The user confirms the old query returns no results.
8. The user searches with the new title and finds the renamed note again.
9. The user deletes another note and confirms the remaining note flow still works.

## J4. Move a note between priority views and find it in the new one

1. The user logs in and works with one high-priority note and one low-priority note.
2. The user opens the high-priority dashboard view.
3. The user confirms only the high-priority note is visible there.
4. The user opens that note in detail view.
5. The user edits the note's title, description, and priority from High to Low.
6. The user returns to the old High view and confirms the moved note is gone.
7. The user switches to the Low view and confirms both low-priority notes are present.
8. The user searches within that view and finds the moved note by its updated title.
9. The user opens the note detail page and verifies the new content is saved.

## J5. Move a note from completed back to active while deleting another note

1. The user logs in and creates two notes.
2. The user marks the first note as completed directly from the dashboard card.
3. The user switches to the completed filter and confirms only that note appears.
4. The user opens the completed note in detail view.
5. The user changes it back to active.
6. The user returns to the dashboard and switches to the active filter.
7. The user confirms the reopened note is visible there again.
8. The user deletes the second note.
9. The user searches for the reopened note and confirms it remains accessible.

## J6. Work through the smart list and confirm the note survives outside it

1. The user logs in and has three notes available: one urgent today, one future note, and one without a deadline.
2. The user opens the smart list.
3. The user confirms only the urgent unfinished note appears there.
4. The user opens the urgent note in detail view.
5. The user edits the note title and description.
6. The user marks the note as completed.
7. The user returns to the smart list and confirms the note disappears from that view.
8. The user returns to the full dashboard, searches for the updated note, and reopens it.
9. The user confirms the completed note still exists in the system even though it no longer belongs to the smart list.

## J7. Keep dashboard metadata and detail metadata consistent

1. The user logs in and works with a note that includes title, description, deadline, repeat rule, and priority.
2. The user verifies the dashboard card shows the important metadata indicators.
3. The user opens the detail page and confirms the same metadata is visible there.
4. The user edits the note title and description.
5. The user changes the note priority.
6. The user returns to the dashboard and confirms the updated title appears there.
7. The user opens the new priority view and finds the edited note.
8. The user reopens the detail page and confirms the edited metadata matches the dashboard state.

## J8. Update a note from page two and remove it after searching

1. The user logs in and creates one target note.
2. The user works with enough additional notes for the dashboard to span two pages.
3. The user confirms page one and page two navigation is available.
4. The user navigates to page two and finds the original target note there.
5. The user opens the target note in detail view.
6. The user edits the note title and description.
7. The user returns to page two and confirms the updated title is still shown there.
8. The user searches for the updated title.
9. The user opens the note again and deletes it.
10. The user returns to the dashboard and confirms the deleted note no longer appears in search results.

## J9. Recover from duplicate registration and bad-password login

1. The user registers a new account successfully.
2. The user tries to register the same account again and gets a duplicate-account error.
3. The user attempts login with the wrong password and gets an authentication error.
4. The user logs in with the correct password.
5. The user creates two notes.
6. The user deletes one of them.
7. The user searches for the remaining note.
8. The user opens the detail page and confirms the surviving note content is intact.

## J10. Upload files, add one more later, and verify attachment visibility across the app

1. The user logs in and creates a note.
2. During creation, the user uploads two files.
3. The user confirms both file names are listed before submitting.
4. The user creates the note and confirms the dashboard card shows an attachment count.
5. The user opens the note detail page and confirms both uploaded files are listed there.
6. The user edits the same note.
7. The user changes the title and description and uploads one more file.
8. The user confirms the existing attachments and the newly added file are all visible.
9. The user saves the note and confirms the detail page now shows three attachments.
10. The user opens the profile page and verifies the storage section is visible.
11. The user returns to the dashboard, searches for the edited note, and deletes it.
