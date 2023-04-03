import React from 'react';
import styles from './print-component.scss';
interface Props {
  message: any;
  title: any;
  optionalData: any;
}

export class PrintComponent extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = { message: '' };
    this.state = { title: '' };
    this.state = { optionalData: '' };
  }
  render() {
    return (
      <div className={`${styles.yourClassName} `}>
        <div className={`${styles.reportcontent} `}>
          <div className={`${styles.reportheader} `}>
            <img
              src="https://labsmart-healthcare-trial.s3.us-west-2.amazonaws.com/diagnostic_lab_524/sample_report_header.jpg"
              alt="lab-name-header"
            />
          </div>
          <div className={`${styles.patientdetails} `}>
            <hr></hr>

            {this.props.optionalData}
            <hr></hr>
          </div>
          <div className={`${styles.title} `}>{this.props.title}</div>
          {this.props.message}

          <div className={`${styles.reportsign} `}>
            <div className={`${styles.labinchargesign} `}>
              <img
                src="https://labsmart-healthcare-trial.s3.us-west-2.amazonaws.com/diagnostic_lab_524/sample_lab_incharge_sign.jpg"
                alt="footer"
              />
              <figcaption>Mr. Sachin Sharma</figcaption>
            </div>

            <div className={`${styles.labdoctorsign} `}>
              <img
                src="https://labsmart-healthcare-trial.s3.us-west-2.amazonaws.com/diagnostic_lab_524/sample_pathologist_sign.jpg"
                alt=""
              />
              <figcaption>Dr. A.K. Asthana</figcaption>
            </div>
          </div>
          <div className={`${styles.leportfooter} `}>
            <img
              src="https://labsmart-healthcare-trial.s3.us-west-2.amazonaws.com/diagnostic_lab_524/sample_report_footer.jpg"
              alt="lab-footer"
            />
          </div>
        </div>
      </div>
    );
  }
}
