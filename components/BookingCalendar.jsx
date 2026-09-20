'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { supabase } from '@/lib/supabaseClient';
import { generateSlots, TOTAL_SLOTS_PER_DAY } from '@/lib/slots';

export default function BookingCalendar({ onSlotSelected }) {
  const [month, setMonth] = useState(new Date());
  const [fullyBookedDates, setFullyBookedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);


  useEffect(() => {
    async function fetchMonthCounts() {
      const start = new Date(month.getFullYear(), month.getMonth(), 1);
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const { data, error } = await supabase.rpc('get_month_booking_counts', {
        p_start: start.toISOString().split('T')[0],
        p_end: end.toISOString().split('T')[0],
      });

      if (error) {
        console.error('Error fetching month counts:', error);
        return;
      }

      const full = (data ?? [])
        .filter((row) => row.booked_count >= TOTAL_SLOTS_PER_DAY)
        .map((row) => new Date(row.appointment_date));

      setFullyBookedDates(full);
    }

    fetchMonthCounts();
  }, [month]);

  async function handleDateSelect(date) {
    if (!date) return;
    setSelectedDate(date);
    setSelectedTime(null);
    setLoadingSlots(true);

    const dateStr = date.toISOString().split('T')[0];
    const { data, error } = await supabase.rpc('get_booked_slots', {
      p_date: dateStr,
    });

    if (error) {
      console.error('Error fetching booked slots:', error);
      setLoadingSlots(false);
      return;
    }

    const takenTimes = (data ?? []).map((row) => {
      const d = new Date(row.appointment_datetime);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });

    setBookedTimes(takenTimes);
    setLoadingSlots(false);
  }

  const allSlots = generateSlots();

  const disabledDays = [
    { before: new Date() },
    ...fullyBookedDates,
  ];

    return (
    <div>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        onMonthChange={setMonth}
        disabled={disabledDays}
      />

      {selectedDate && (
        <div>
          <h3 className="available-times-heading">
            Available times for {selectedDate.toDateString()}
          </h3>
          {loadingSlots ? (
            <p>Loading...</p>
          ) : (
            <div className="slot-grid">
              {allSlots.map((time) => {
                const isTaken = bookedTimes.includes(time);
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    className={`slot-pill${isSelected ? ' selected' : ''}`}
                    disabled={isTaken}
                    onClick={() => {
                      setSelectedTime(time);
                      onSlotSelected(selectedDate, time);
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}