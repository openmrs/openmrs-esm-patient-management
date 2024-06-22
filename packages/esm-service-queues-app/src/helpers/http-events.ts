export const emitRefetchQueuesEvent = (queueUUID: string = '') => {
  const event = new CustomEvent('refetchQueues', { detail: queueUUID });
  window.dispatchEvent(event);
};
