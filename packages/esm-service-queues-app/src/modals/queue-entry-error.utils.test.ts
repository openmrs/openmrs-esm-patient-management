import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './queue-entry-error.utils';

const fetchErrorMessage =
  'Server responded with 400 (Bad Request) for url /openmrs/ws/rest/v1/queueutil/assignticket. Check err.responseBody or network tab in dev tools for more info';

describe('getErrorMessage', () => {
  it('returns the message from a JSON error body', () => {
    expect(
      getErrorMessage({
        message: fetchErrorMessage,
        responseBody: { error: { message: 'Queue entry could not be updated' } },
      }),
    ).toBe('Queue entry could not be updated');
  });

  it('returns a plain-text error body', () => {
    expect(getErrorMessage({ message: fetchErrorMessage, responseBody: 'One of the required fields is empty' })).toBe(
      'One of the required fields is empty',
    );
  });

  it('falls back to the error message when the body is an HTML page', () => {
    expect(
      getErrorMessage({
        message: fetchErrorMessage,
        responseBody:
          '<html>\r\n<head><title>502 Bad Gateway</title></head>\r\n<body>\r\n<center><h1>502 Bad Gateway</h1></center>\r\n<hr><center>nginx</center>\r\n</body>\r\n</html>\r\n',
      }),
    ).toBe(fetchErrorMessage);
  });

  it('falls back to the error message when the body is too long', () => {
    expect(getErrorMessage({ message: fetchErrorMessage, responseBody: 'a'.repeat(501) })).toBe(fetchErrorMessage);
  });

  it('falls back to the error message when the body is an empty string', () => {
    expect(getErrorMessage({ message: fetchErrorMessage, responseBody: '' })).toBe(fetchErrorMessage);
  });
});
