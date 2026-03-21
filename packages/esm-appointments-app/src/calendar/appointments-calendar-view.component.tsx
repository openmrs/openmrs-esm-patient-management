import React, { useState } from 'react';
import {
  Modal,
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
} from '@carbon/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import { useSelectedDate } from '../hooks/useSelectedDate';
import Dailyappointmentsview from './daily/dailyappointmentsview';

import { User, Calendar } from '@carbon/react/icons';

const AppointmentsCalendarView: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedDateState, setSelectedDateState] = useState<string | null>(null);

  const [dailyAppointments, setDailyAppointments] = useState<any[]>([]);
  const [showDailyView, setShowDailyView] = useState(false);

  const { t } = useTranslation();
  const selectedDate = useSelectedDate();

  const { calendarEvents, isLoading, error } = useAppointmentsCalendar(
    selectedDateState || dayjs(selectedDate).toISOString(),
    'monthly',
  );

  const selectedDayData = calendarEvents?.find((event) => event.appointmentDate === selectedDateState);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />
      <CalendarHeader />

      {/* 📅 Calendar */}
      <MonthlyCalendarView
        events={calendarEvents}
        onDateClick={(date) => {
          setSelectedDateState(date);
          setOpen(true);
          setShowDailyView(false); // reset view on new open

          // Dummy data
          setDailyAppointments([
            {
              patient: { display: 'Rahul Sharma' },
              status: 'Scheduled',
              startDateTime: `${date}T10:00:00`,
            },
            {
              patient: { display: 'Priya Singh' },
              status: 'Completed',
              startDateTime: `${date}T11:30:00`,
            },
            {
              patient: { display: 'Amit Verma' },
              status: 'Pending',
              startDateTime: `${date}T13:00:00`,
            },
          ]);
        }}
      />

      {/* 🔥 MODAL */}
      <Modal
        open={open}
        modalHeading={`📅 Appointments for ${selectedDateState ? dayjs(selectedDateState).format('DD MMM YYYY') : ''}`}
        primaryButtonText="Close"
        onRequestClose={() => {
          setOpen(false);
          setSelectedDateState(null);
          setDailyAppointments([]);
          setShowDailyView(false);
        }}
        onRequestSubmit={() => setOpen(false)}>
        {showDailyView ? (
          <Dailyappointmentsview
            date={new Date(selectedDateState!)}
            appointments={dailyAppointments.map((appt) => ({
              patient: appt.patient.display,
              time: dayjs(appt.startDateTime).format('HH:mm'),
              status: appt.status,
            }))}
            onBack={() => setShowDailyView(false)} // ✅ FIXED
          />
        ) : isLoading ? (
          <DataTableSkeleton rowCount={4} columnCount={2} zebra />
        ) : error ? (
          <p>Error loading data</p>
        ) : !selectedDayData ? (
          <p style={{ color: '#666' }}>No appointments scheduled for this day</p>
        ) : (
          <>
            {/* 🔢 TOTAL */}
            <h4 style={{ marginBottom: '12px', display: 'flex', gap: '6px' }}>
              <Calendar size={16} />
              Total Appointments: {selectedDayData.services.reduce((sum, s) => sum + s.count, 0)}
            </h4>

            {/* 📊 SERVICE TABLE */}
            <DataTable
              rows={selectedDayData.services.map((service, index) => ({
                id: String(index),
                service: service.serviceName,
                count: service.count,
              }))}
              headers={[
                { key: 'service', header: 'Service Name' },
                { key: 'count', header: 'Appointments' },
              ]}>
              {({ rows, headers, getHeaderProps, getRowProps }) => (
                <Table>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {rows.map((row) => (
                      <TableRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>

            <hr style={{ margin: '20px 0' }} />

            {/* 👤 DETAILS */}
            <h5 style={{ display: 'flex', gap: '6px' }}>
              <User size={16} />
              Appointment Details
            </h5>

            {dailyAppointments.length === 0 ? (
              <p style={{ color: '#666' }}>No detailed appointments found</p>
            ) : (
              dailyAppointments.map((appt, index) => (
                <div
                  key={index}
                  style={{
                    marginTop: '10px',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                  }}>
                  <strong>👤 {appt.patient.display}</strong>

                  <div style={{ marginTop: '6px', color: '#555' }}>
                    ⏰ {dayjs(appt.startDateTime).format('hh:mm A')} {' | '}
                    {appt.status === 'Completed'
                      ? '🟢 Completed'
                      : appt.status === 'Scheduled'
                        ? '🔵 Scheduled'
                        : '🟡 Pending'}
                  </div>
                </div>
              ))
            )}

            {/* 🔥 BUTTON */}
            <Button style={{ marginTop: '20px' }} onClick={() => setShowDailyView(true)}>
              View Full Day
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentsCalendarView;
