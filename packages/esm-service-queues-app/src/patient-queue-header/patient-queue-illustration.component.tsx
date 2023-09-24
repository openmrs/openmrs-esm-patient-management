import React from 'react';

const PatientQueueIllustration: React.FC = () => {
  return (
    <svg width="92" height="94" viewBox="0 0 92 94" xmlns="http://www.w3.org/2000/svg">
      <title>Patient queue illustration</title>
      <g fill="none" fillRule="evenodd">
        <path fill="#FFF" d="M0 0h92v94H0z" />
        <path
          d="M40 32c.84-.602 1.12-1.797 1-3 .12-5.005-3.96-9-9-9s-9.12 3.995-9 9c-.12 3.572 2.1 6.706 5 8-6.76 1.741-12 7.91-12 15v15h28V32h-4zM76 67V52c0-7.09-5.24-13.278-12-15 2.9-1.294 5.12-4.428 5-8 .12-5.005-3.96-9-9-9s-9.12 3.995-9 9c-.12 1.203.14 2.398 1 3h-4v35h28z"
          fill="#CEE6E5"
        />
        <path
          d="M32 75V60.312c0-7.402 5.24-13.59 12.3-15.216-3.2-1.39-5.42-4.523-5.42-8.166 0-4.935 4.08-8.93 9.12-8.93 5.04 0 9.12 3.995 9.12 8.93 0 3.642-2.22 6.776-5.42 8.166C58.76 46.741 64 52.91 64 60.313V75"
          fill="#7BBCB9"
        />
      </g>
    </svg>
  );
};

export default PatientQueueIllustration;
