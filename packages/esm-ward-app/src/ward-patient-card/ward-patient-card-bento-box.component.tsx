import React from 'react';
import { useParams } from 'react-router-dom';
import type { WardPatientCardProps } from '../types';
import { useBentoElements } from './ward-patient-card-bento-box.resources';

interface WardPatientCardBentoBoxProps extends WardPatientCardProps {
  className?: string;
}

/**
 * A bento box is a row in the patient card that lists any number of attributes
 * about the patient. For example, in this mockup of the
 * [PNC ward](https://app.zeplin.io/project/65f454477b16814668c38d02/screen/65fda2311a404d8905dec9e0),
 * patient's card's header row, footer row, and even the baby
 * information row can be modeled as a bento box.
 */
const WardPatientCardBentoBox: React.FC<WardPatientCardBentoBoxProps> = ({ patient, bed, className }) => {
  const { locationUuid } = useParams();
  const bentoElements = useBentoElements(locationUuid);

  return (
    <div className={className}>
      {bentoElements.map((BentoElement, i) => (
        <BentoElement patient={patient} bed={bed} key={i} />
      ))}
    </div>
  );
};

export default WardPatientCardBentoBox;
