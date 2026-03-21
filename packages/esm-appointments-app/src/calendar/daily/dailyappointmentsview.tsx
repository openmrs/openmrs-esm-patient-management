import React from 'react';
import dayjs from 'dayjs';
import { Button, Tag, Tile } from '@carbon/react';

type DailyAppointmentsViewProps = {
  date: Date | null;
  appointments:
    | {
        patient: string;
        time: string; // expected format: HH:mm
        status: string;
      }[]
    | null
    | undefined;
  onBack: () => void;
};

const Dailyappointmentsview: React.FC<DailyAppointmentsViewProps> = ({ date, appointments, onBack }) => {
  // ✅ Edge Case: Invalid date
  if (!date || isNaN(date.getTime())) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={{ color: 'red' }}>Invalid date selected</p>
        <Button kind="secondary" onClick={onBack}>
          ← Back
        </Button>
      </div>
    );
  }

  // ✅ Edge Case: No data
  if (!appointments || appointments.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>📅 {date.toDateString()}</h3>
          <Button kind="secondary" onClick={onBack}>
            ← Back to Summary
          </Button>
        </div>

        <Tile style={{ marginTop: '16px' }}>No appointments found for this day</Tile>
      </div>
    );
  }

  // ✅ Generate 30-minute time slots
  const generateTimeSlots = () => {
    const slots: string[] = [];
    let current = dayjs(date).hour(9).minute(0);
    const end = dayjs(date).hour(17).minute(0);

    while (current.isBefore(end) || current.isSame(end)) {
      slots.push(current.format('HH:mm'));
      current = current.add(30, 'minute');
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // ✅ Match appointments to slot using proper time comparison
  const getAppointmentsForTime = (slotTime: string) => {
    const slot = dayjs(date)
      .hour(Number(slotTime.split(':')[0]))
      .minute(Number(slotTime.split(':')[1]));

    return appointments.filter((appt) => {
      const apptTime = dayjs(`${dayjs(date).format('YYYY-MM-DD')}T${appt.time}`);
      return apptTime.isSame(slot);
    });
  };

  // ✅ Status tag mapping
  const getTagType = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'blue';
      case 'Completed':
        return 'green';
      case 'Pending':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
        <h3>📅 {date.toDateString()}</h3>

        <Button kind="secondary" onClick={onBack}>
          ← Back to Summary
        </Button>
      </div>

      {/* Timeline */}
      <div>
        {timeSlots.map((time) => {
          const slotAppointments = getAppointmentsForTime(time);

          return (
            <div
              key={time}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '12px 0',
                borderBottom: '1px solid #eee',
              }}>
              {/* Time */}
              <div style={{ width: '90px', fontWeight: 600 }}>{time}</div>

              {/* Appointments */}
              <div style={{ flex: 1 }}>
                {slotAppointments.length > 0 ? (
                  slotAppointments.map((appt, index) => (
                    <Tile
                      key={index}
                      style={{
                        marginBottom: '10px',
                        padding: '12px',
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <div>
                          <strong>👤 {appt.patient}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>⏰ {appt.time}</div>
                        </div>

                        <Tag type={getTagType(appt.status)}>{appt.status}</Tag>
                      </div>
                    </Tile>
                  ))
                ) : (
                  <div style={{ color: '#999', fontSize: '14px' }}>No appointments</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dailyappointmentsview;
