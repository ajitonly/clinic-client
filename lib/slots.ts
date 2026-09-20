export function generateSlots() {
  const slots = [];
  let hour = 8;
  let minute = 0;

  while (hour < 17) { // 5pm = 17:00, stop before it
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    slots.push(time);

    minute += 30;
    if (minute === 60) {
      minute = 0;
      hour += 1;
    }
  }

  return slots; // ["08:00", "08:30", ..., "16:30"]
}

export const TOTAL_SLOTS_PER_DAY = 18; // 8am–5pm in 30-min increments