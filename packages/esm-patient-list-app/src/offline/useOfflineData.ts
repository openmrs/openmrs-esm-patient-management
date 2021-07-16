import React from 'react';
import db from './offlineData';

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const useOfflineData = () => {
  const [data, setData] = React.useState<ThenArg<ReturnType<typeof db.getPatientData>>>([]);
  React.useEffect(() => {
    db.getPatientData().then((data) => setData(data));
    return db.subscribe((data) => setData(data));
  }, []);

  return data;
};
