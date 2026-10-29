function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asMessage(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readServerReason(error: unknown) {
  const body = isRecord(error) ? error.responseBody : undefined;
  const err = isRecord(body) ? body.error : undefined;
  let reason = asMessage(isRecord(err) ? err.message : undefined);
  if (!reason) {
    reason = asMessage(isRecord(body) ? body.message : undefined);
  }
  if (!reason && isRecord(err) && isRecord(err.fieldErrors)) {
    for (const value of Object.values(err.fieldErrors)) {
      const row = Array.isArray(value) ? value[0] : value;
      reason = asMessage(isRecord(row) ? row.message : undefined);
      if (reason) {
        break;
      }
    }
  }
  if (!reason && isRecord(err) && Array.isArray(err.globalErrors)) {
    const first = err.globalErrors[0];
    reason = asMessage(isRecord(first) ? first.message : undefined);
  }
  return reason;
}

/**
 * Text for a failed appointment save. Uses the server validation message when it
 * is safe to show. Ignores the openmrsFetch wrapper (`error.message`).
 * Callers pass already-translated strings so the catalog extractor sees the keys.
 */
export function appointmentScheduleErrorText(
  error: unknown,
  messages: { fallback: string; withReason: (reason: string) => string },
) {
  const fallback = messages.fallback;
  let reason = readServerReason(error);
  if (reason.includes('<') || reason.includes('>')) {
    return fallback;
  }
  reason = reason.replace(/^\[+/, '').replace(/\]+$/, '').trim();
  if (!reason || reason.length > 300) {
    return fallback;
  }
  const lower = reason.toLowerCase();
  if (
    lower.includes('http:') ||
    lower.includes('https:') ||
    lower.includes('/ws/') ||
    lower.includes('server responded') ||
    lower.includes('responsebody') ||
    lower.includes('network tab') ||
    lower.includes('exception') ||
    lower.includes('stack trace')
  ) {
    return fallback;
  }
  return messages.withReason(reason);
}
