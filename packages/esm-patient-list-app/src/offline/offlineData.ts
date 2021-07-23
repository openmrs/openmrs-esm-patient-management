import { createGlobalStore, getCurrentUser, getGlobalStore } from '@openmrs/esm-framework';
import Dexie from 'dexie';
import { LoadState, OfflinePatient } from './types';

/**
 * Thoughts on behaviour when LOADING or RELOADING are present on DB construction
 * This state means, that the given resource was being loaded but the process was interrupted
 * There are two possible ways to handle this:
 * - set LOADING to LOADING_ERROR and RELOADING to RELOADING_ERROR and let the user trigger the loads again
 * - retrigger the handlers silently on construction
 */

/**
 * required interfaces
 * for handlers:
 * - adding patient handlers
 *
 * for consumers (components/patient list):
 * - adding a patient
 * - removing a patient
 * - reloading a patient
 * - subscribing to the list of patients
 * - retrieving the list of patients
 * - retrieving the list of handlers (should not change after the setup)
 */
interface PatientHandlerObject {
  onLoadPatient: (patientUuid: string, onSuccess: () => void, onError: (err: Error) => void) => void;
  onRemovePatient: (patientUuid: string) => void;
}

/**
 * stores handlers that want to be called when a patient is added or removed
 */
const patientStore = createGlobalStore<Record<string, PatientHandlerObject>>('offline-patients-handler', {});
export function addPatientHandler(uuid: string, handlerObject: PatientHandlerObject) {
  getGlobalStore<Record<string, PatientHandlerObject>>('offline-patients-handler').setState((state) => ({
    ...state,
    [uuid]: handlerObject,
  }));
}

function getOfflineHandlers(): Array<string> {
  return Object.keys(patientStore.getState());
}

// Declare Database
class OfflinePatientDatabase extends Dexie {
  private offlinePatients: Dexie.Table<OfflinePatient, string>; // id is number in this case
  private currentUser = 'unauthorized_user'; // will be automatically set to current user if logged in
  private changeSubscribers = new Set<(data: Array<OfflinePatient>) => void>();
  private broadcastChange = () => {}; // is overwritten if the Broadcastchannel is available

  constructor() {
    super('EsmPatientListOfflinePatients');
    this.version(5).stores({
      offlinePatients: 'uuid',
    });
    this.offlinePatients = this.table('offlinePatients');
    getCurrentUser().subscribe((user) => {
      this.currentUser = user.uuid;
    });

    // If the browser supports broadcasting, connect the instances to sync DB changes
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('offline_patient_sync_channel');
      this.broadcastChange = () => channel.postMessage('db_changed');
      channel.onmessage = () => this.handleRemoteDBChange();
    }
  }

  private handleDBChange() {
    this.broadcastChange();
    this.handleRemoteDBChange();
  }

  private handleRemoteDBChange() {
    this.getPatientData().then((data) => {
      this.changeSubscribers.forEach((sub) => sub(data));
    });
  }

  /**
   * Subscribe to DB changes
   * @param handler to be called with new offlinePatient data
   * @returns {function} unsubscribe function
   */
  subscribe(handler: (data: Array<OfflinePatient>) => void) {
    this.changeSubscribers.add(handler);
    return () => {
      this.changeSubscribers.delete(handler);
    };
  }

  /**
   * The returned data is filtered by user
   */
  async getPatientData(): Promise<Array<OfflinePatient>> {
    return this.offlinePatients.filter((ob) => ob.interestedUsers.includes(this.currentUser)).toArray();
  }

  /**
   * Add a patient to the offline list
   * Triggers loads on all registered handlers
   */
  async addPatient(patientUuid: string, name: string) {
    // in all all cases set state to LOADING for all handlers
    Object.entries(patientStore.getState()).forEach(([handlerUuid, handlers]) => {
      handlers.onLoadPatient(
        patientUuid,
        () => this.setLastUpdated(patientUuid, handlerUuid),
        (err: Error) => this.setUpdateFailed(patientUuid, handlerUuid, err),
      );
    });
    const patient = await this.offlinePatients.where({ uuid: patientUuid }).first();

    if (patient) {
      const lastUpdate: OfflinePatient['lastUpdate'] = Object.fromEntries(
        Object.entries(patient.lastUpdate).map(([handlerUuid, { date }]: any) => [
          handlerUuid,
          !!date ? { type: 'RELOADING', date } : { type: 'LOADING' },
        ]),
      );
      if (!patient.interestedUsers.includes(this.currentUser)) {
        // adding current user as interested
        await db.offlinePatients.put(
          { ...patient, lastUpdate, interestedUsers: [...patient.interestedUsers, this.currentUser] },
          patient.uuid,
        );
      } else {
        // reloading
        await db.offlinePatients.put({ ...patient, lastUpdate }, patient.uuid);
      }
    } else {
      // creating patient entry
      await this.offlinePatients.add({
        uuid: patientUuid,
        name,
        lastUpdate: Object.fromEntries(getOfflineHandlers().map((handlerUuid) => [handlerUuid, { type: 'LOADING' }])),
        interestedUsers: [this.currentUser],
      });
    }
    this.handleDBChange();
  }

  /**
   * Remove a patient from the offline list
   * Triggers remove on all registered handlers if there are no interested users left
   */
  async removePatient(patientUuid: string) {
    const patient = await this.offlinePatients.where({ uuid: patientUuid }).first();
    if (patient && patient.interestedUsers.includes(this.currentUser)) {
      if (patient.interestedUsers.length > 1) {
        return this.offlinePatients.put(
          { ...patient, interestedUsers: patient.interestedUsers.filter((u) => u !== this.currentUser) },
          patient.uuid,
        );
      } else {
        Object.values(patientStore.getState()).forEach((handlers) => {
          handlers.onRemovePatient(patientUuid);
        });
        const updatePromise = this.offlinePatients.delete(patient.uuid);
        updatePromise.then(() => this.handleDBChange());
        return updatePromise;
      }
    }
  }

  /**
   * For handlers
   * Set a resource for a given patient to loaded
   */
  async setLastUpdated(patientUuid: string, handlerUuid: string) {
    const pat = await db.offlinePatients.where({ uuid: patientUuid }).first();
    if (pat) {
      const updatePromise = db.offlinePatients.put(
        {
          ...pat,
          lastUpdate: { ...pat.lastUpdate, [handlerUuid]: { type: 'LOADED', date: new Date() } },
        },
        pat.uuid,
      );
      updatePromise.then(() => this.handleDBChange());
      return updatePromise;
    }
  }

  /**
   * For handlers
   * An error occurred while loading.
   * The last loaded date will be preserved under the assumption that the cache wasn't corrupted
   */
  async setUpdateFailed(patientUuid: string, handlerUuid: string, error: Error) {
    const pat = await db.offlinePatients.where({ uuid: patientUuid }).first();
    if (pat) {
      let newLoadState: LoadState;
      const prevState = pat.lastUpdate[handlerUuid];
      switch (prevState.type) {
        case 'LOADING':
          newLoadState = { type: 'LOADING_ERROR', error };
          break;

        case 'RELOADING':
          newLoadState = { type: 'RELOADING_ERROR', error, date: prevState.date };
          break;

        default:
          return;
      }
      const updatePromise = db.offlinePatients.put(
        { ...pat, lastUpdate: { ...pat.lastUpdate, [handlerUuid]: newLoadState } },
        pat.uuid,
      );
      updatePromise.then(() => this.handleDBChange());
      return updatePromise;
    }
  }
}

const db = new OfflinePatientDatabase();

export default {
  addPatient: db.addPatient.bind(db) as OfflinePatientDatabase['addPatient'],
  reloadPatient: db.addPatient.bind(db) as OfflinePatientDatabase['addPatient'],
  removePatient: db.removePatient.bind(db) as OfflinePatientDatabase['removePatient'],
  subscribe: db.subscribe.bind(db) as OfflinePatientDatabase['subscribe'],
  getPatientData: db.getPatientData.bind(db) as OfflinePatientDatabase['getPatientData'],
  getOfflineHandlers,
};
