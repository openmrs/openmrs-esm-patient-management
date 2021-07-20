import { useState, useEffect } from 'react';
import db from './offlineData';

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export const useOfflineData = () => {
  const [data, setData] = useState<ThenArg<ReturnType<typeof db.getPatientData>>>([]);

  useEffect(() => {
    db.getPatientData().then((data) => setData(data));
    return db.subscribe((data) => setData(data));
  }, []);

  return data;
};
