import { type APIRequestContext, expect } from '@playwright/test';
import dayjs from 'dayjs';
import { type Visit } from '@openmrs/esm-framework';
import { type Encounter } from '../commands/types';
import { test } from '../core';
import { ServiceQueuesPage } from '../pages';

// Both visit tabs render the chart's `visit-summary` extension, and Service Queues hands it a handler that
// edits encounters through its own workspaces rather than the chart's. This guards that wiring.

// Reference application metadata, as in service-queues.spec.ts.
const outpatientClinic = '44c3efb0-2583-4c80-a79e-1f756a03c0a1';
const facilityVisitType = '7b0f5697-27e3-40c4-8bae-f4049abfb4ed';
const visitNoteEncounterType = 'd7151f82-c1f3-4152-a605-2f9ea7414a79';
const encounterNoteTextConcept = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const outpatientConsultationQueue = '13b656d3-e141-11ee-bad2-0242ac120002';
const notUrgentPriority = 'f4620bfa-3625-4883-bd3f-84c2cce14470';
const waitingStatus = '51ae5e4d-b72b-4912-bf31-a17efb690aeb';

const encounterNote = 'Note recorded on the previous visit';
const omrsDatetime = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

let pastVisit: Visit;
let activeVisit: Visit;
let encounter: Encounter;
let queueEntryUuid: string;

// Posts and fails loudly — a silently rejected setup call surfaces much later as a missing table row.
async function post(api: APIRequestContext, path: string, data: Record<string, unknown>) {
  const res = await api.post(path, { data });
  expect(res.ok(), `POST ${path} failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  return res.json();
}

test.beforeEach(async ({ api, patient }) => {
  // A visit `usePastVisits` will surface: ended, and wholly before today. Both the visit window and the
  // encounter datetime are explicit — an encounter falling outside its visit's range is rejected, and the
  // resulting record then cannot be voided.
  const visitStart = dayjs().subtract(1, 'day').hour(9).minute(0).second(0);
  pastVisit = await post(api, 'visit', {
    startDatetime: visitStart.format(omrsDatetime),
    stopDatetime: visitStart.add(3, 'hour').format(omrsDatetime),
    patient: patient.uuid,
    location: outpatientClinic,
    visitType: facilityVisitType,
    attributes: [],
  });

  encounter = await post(api, 'encounter', {
    encounterDatetime: visitStart.add(1, 'hour').format(omrsDatetime),
    patient: patient.uuid,
    location: outpatientClinic,
    encounterType: visitNoteEncounterType,
    visit: pastVisit.uuid,
    obs: [{ concept: { uuid: encounterNoteTextConcept }, value: encounterNote }],
  });

  // A queue entry needs an active visit.
  activeVisit = await post(api, 'visit', {
    startDatetime: dayjs().format(omrsDatetime),
    patient: patient.uuid,
    location: outpatientClinic,
    visitType: facilityVisitType,
    attributes: [],
  });

  const queueEntry = await post(api, 'queue-entry', {
    queue: outpatientConsultationQueue,
    patient: patient.uuid,
    visit: activeVisit.uuid,
    priority: notUrgentPriority,
    status: waitingStatus,
    startedAt: dayjs().format(omrsDatetime),
  });
  queueEntryUuid = queueEntry.uuid;
});

// Void what we created, newest first — the `patient` fixture cannot delete a patient that still has visits.
test.afterEach(async ({ api }) => {
  await api.delete(`queue-entry/${queueEntryUuid}`);
  await api.delete(`encounter/${encounter.uuid}`);
  await api.delete(`visit/${activeVisit.uuid}`);
  await api.delete(`visit/${pastVisit.uuid}`);
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

  await test.step('Then I should see the encounter recorded on that visit', async () => {
    const encounterRow = page.getByRole('row').filter({ hasText: 'Visit Note' });
    await expect(encounterRow).toBeVisible();
    await encounterRow.getByRole('button').first().click();
    // Scope to the cell: the queue entry's own expanded row contains this table, so a row-level locator
    // matches both.
    await expect(page.getByRole('cell', { name: new RegExp(`Text of encounter note ${encounterNote}`) })).toBeVisible();
  });

  await test.step('When I choose "Edit this encounter"', async () => {
    await page
      .getByRole('button', { name: /edit this encounter/i })
      .first()
      .click();
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
