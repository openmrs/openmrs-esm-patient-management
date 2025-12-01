import React from 'react';
import { LocationIcon, PhoneIcon, WhatsAppIcon, EmailIcon, WebsiteIcon } from './icons';
import styles from '../prescription-template.scss';

interface ContactInfo {
  hospitalName?: string;
  hospitalSlogan?: string;
  address?: string;
  landlineNumber?: string;
  whatsappNumber?: string;
  email?: string;
  website?: string;
}

interface ContactRowProps {
  icon: React.ReactNode;
  text: string;
}

const ContactRow: React.FC<ContactRowProps> = ({ icon, text }) => (
  <div className={styles.contactRow}>
    {icon}
    <span>{text}</span>
  </div>
);

export const PrescriptionFooter: React.FC<ContactInfo> = ({
  hospitalName = 'HOSPITAL',
  hospitalSlogan = 'SLOGAN HERE',
  address,
  landlineNumber,
  whatsappNumber,
  email,
  website,
}) => {
  return (
    <div className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.hospitalSection}>
          <h2 className={styles.hospitalName}>{hospitalName}</h2>
          <p className={styles.hospitalSlogan}>{hospitalSlogan}</p>
          {address && (
            <div className={styles.hospitalAddress}>
              <LocationIcon className={styles.icon} />
              <span>{address}</span>
            </div>
          )}
        </div>
        <div className={styles.contactSection}>
          {landlineNumber && <ContactRow icon={<PhoneIcon className={styles.icon} />} text={landlineNumber} />}
          {whatsappNumber && <ContactRow icon={<WhatsAppIcon className={styles.icon} />} text={whatsappNumber} />}
          {email && <ContactRow icon={<EmailIcon className={styles.icon} />} text={email} />}
          {website && <ContactRow icon={<WebsiteIcon className={styles.icon} />} text={website} />}
        </div>
      </div>
    </div>
  );
};
