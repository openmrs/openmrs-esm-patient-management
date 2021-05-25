import { addPatientToPatientList, createPatientList, newUuid, updatePatientListDetails } from './mock';
import { PATIENT_LIST_TYPE } from './types';

const setup = async () => {
  const myListUuid = await createPatientList('my favorite patients', 'description');
  const myListPatients = Array.from({ length: 37 }, newUuid);
  await Promise.all(
    myListPatients.map((p) => {
      return addPatientToPatientList(p, myListUuid);
    }),
  );

  const systemUuid = await createPatientList('waiting list', 'description', PATIENT_LIST_TYPE.SYSTEM);
  const systemPatients = Array.from({ length: 24 }, newUuid);
  await Promise.all(
    systemPatients.map((p) => {
      return addPatientToPatientList(p, systemUuid);
    }),
  );

  const systemUuid2 = await createPatientList('bathroom black list', 'description', PATIENT_LIST_TYPE.USER);
  const systemPatient2s = Array.from({ length: 16 }, newUuid);
  await Promise.all(
    systemPatient2s.map((p) => {
      return addPatientToPatientList(p, systemUuid2);
    }),
  );

  updatePatientListDetails(myListUuid, { isStarred: true });
};

export default setup;
