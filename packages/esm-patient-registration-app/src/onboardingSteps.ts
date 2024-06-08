export const onboardingSteps = [
  {
    target: '[aria-label="Demographics Section"]',
    content:
      'This is the Demographics section. Here you can find various fields and information related to the patient.',
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '[aria-label="Contact Details Section"]',
    content: "Here you can update the patient's contact information.",
    disableBeacon: true,
    placement: 'right',
  },

  {
    target: '[aria-label="Relationships section"]',
    content: "In this section, you can manage the patient's relationships.",
    disableBeacon: true,
  },
];
