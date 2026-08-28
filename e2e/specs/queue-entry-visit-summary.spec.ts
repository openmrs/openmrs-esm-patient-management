import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { addQueueEntry, createVisitNoteEncounter, startPastVisit, startVisit } from '../commands';
import { type Encounter, type QueueEntry } from '../commands/types';
import { test } from '../core';
import { ServiceQueuesPage } from '../pages';

// Both visit tabs render the chart's `visit-summary` extension, and Service Queues hands it a handler that
// edits encounters through its own workspaces rather than the chart's. This guards that wiring.

const encounterNote = 'Note recorded on the previous visit';

let pastVisit: Visit;
let activeVisit: Visit;
let encounter: Encounter;
let queueEntry: QueueEntry;

test.beforeEach(async ({ api, patient }) => {
  pastVisit = await startPastVisit(api, patient.uuid);
  encounter = await createVisitNoteEncounter(api, patient.uuid, pastVisit, encounterNote);
  // A queue entry needs an active visit.
  activeVisit = await startVisit(api, patient.uuid);
  queueEntry = await addQueueEntry(api, patient.uuid, activeVisit.uuid);
});

// Void what we created, newest first — the `patient` fixture cannot delete a patient that still has visits.
// Each is guarded so that a setup failure part-way through still tears down whatever did get created.
test.afterEach(async ({ api }) => {
  for (const path of [
    queueEntry?.uuid && `queue-entry/${queueEntry.uuid}`,
    encounter?.uuid && `encounter/${encounter.uuid}`,
    activeVisit?.uuid && `visit/${activeVisit.uuid}`,
    pastVisit?.uuid && `visit/${pastVisit.uuid}`,
  ]) {
    if (path) {
      await api.delete(path);
    }
  }
});

test('Edit an encounter from the Previous visit tab of a queue entry', async ({ page, patient }) => {
  const serviceQueuesPage = new ServiceQueuesPage(page);
  const [firstName, lastName] = patient.person.display.split(' ');

  await test.step('When I go to the Service queues page', async () => {
    await serviceQueuesPage.goto();
  });

  await test.step("And I expand the patient's queue entry", async () => {
    // Filter rather than scan the table: the server may already have more entries than fit on a page.
    await page.getByRole('searchbox', { name: /filter table/i }).fill(`${firstName} ${lastName}`);
    const patientRow = page
      .getByRole('row')
      .filter({ has: page.getByRole('link', { name: `${firstName} ${lastName}` }) });
    await expect(patientRow).toBeVisible();
    await patientRow.getByRole('button', { name: /expand current row/i }).click();
  });

  await test.step('And I open the Encounters tab of the Previous visit', async () => {
    await page.getByRole('tab', { name: /previous visit/i }).click();
    await page.getByRole('tab', { name: /encounters/i }).click();
  });

  const encounters = page.getByLabel(/queue table/i).getByRole('table');

  await test.step('Then I should see the encounter recorded on that visit', async () => {
    await expect(encounters).toContainText(/visit note/i);
  });

  await test.step('And then I expand that encounter', async () => {
    await encounters.getByRole('button', { name: /expand current row/i }).click();
    await expect(encounters).toContainText(/text of encounter note/i);
  });

  await test.step('When I choose "Edit this encounter"', async () => {
    await encounters.getByRole('button', { name: /edit this encounter/i }).click();
  });

  await test.step('Then the visit note form opens on that encounter, with no extension erroring', async () => {
    const workspace = page.locator('#omrs-workspaces-container');
    // The note is prefilled only when the encounter reaches the form intact, which is what proves it opened
    // for editing rather than as a blank note.
    await expect(workspace.getByPlaceholder(/write any notes here/i)).toHaveValue(encounterNote);
    // The chart's action buttons read their workspace group's props, so a missing group surfaces here as the
    // extension error boundary rather than as a failure of the form itself.
    await expect(page.getByText(/An error has occurred/i)).toHaveCount(0);
  });
});
