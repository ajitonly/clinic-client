"use client";

import { useState } from "react";
import BookingCalendar from "@/components/BookingCalendar";
import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';

export default function HomePage() {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", concern: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [existingAppointment, setExistingAppointment] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [confirmAnyway, setConfirmAnyway] = useState(false);

  function handleSlotSelected(date, time) {
    setSelected({ date, time });
    setResult(null);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handlePhoneBlur() {
    setConfirmAnyway(false);
    setExistingAppointment(null);

    if (!form.phone || form.phone.trim().length < 7) return;

    setCheckingExisting(true);
    const { data, error } = await supabase.rpc("get_my_appointment", {
      p_phone: form.phone.trim(),
    });
    setCheckingExisting(false);

    if (error) {
      console.error("Error checking existing appointment:", error);
      return;
    }

    if (data && data.length > 0) {
      setExistingAppointment(data[0]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;
    if (existingAppointment && !confirmAnyway) return;

    setSubmitting(true);
    setResult(null);

    const [hours, minutes] = selected.time.split(":").map(Number);
    const appointmentDate = new Date(selected.date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const { data, error } = await supabase.rpc("book_appointment", {
      p_name: form.name,
      p_phone: form.phone,
      p_concern: form.concern,
      p_datetime: appointmentDate.toISOString(),
    });

    setSubmitting(false);

    if (error) {
  const friendlyMessage = error.message.includes('duplicate key') ||
    error.code === '23505'
    ? 'Sorry, that time slot was just taken by someone else. Please pick a different time.'
    : error.message;
  setResult({ success: false, message: friendlyMessage });
  return;
}

    setResult({ success: true, message: "Appointment booked successfully!" });
    setForm({ name: "", phone: "", concern: "" });
    setSelected(null);
    setExistingAppointment(null);
    setConfirmAnyway(false);
  }

  const canSubmit =
    selected && (!existingAppointment || confirmAnyway) && !submitting;

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
      <h1>Book an Appointment</h1>
      <Link href="/manage">
  <button type="button" style={{ marginBottom: '16px' }}>
    Already booked? Manage your appointment
  </button>
</Link>

      <BookingCalendar onSlotSelected={handleSlotSelected} />

      {selected && (
        <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
          <p>
            Selected: {selected.date.toDateString()} at {selected.time}
          </p>

          <div>
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              required
            />
            {checkingExisting && <p>Checking...</p>}
          </div>

          {existingAppointment && (
            <div
              style={{
                background: "#fff3cd",
                border: "1px solid #ffcc00",
                padding: "12px",
                borderRadius: "6px",
                marginTop: "8px",
              }}
            >
              <p>
                <strong>Heads up:</strong> this phone number already has an
                appointment scheduled for{" "}
                {new Date(
                  existingAppointment.appointment_datetime,
                ).toLocaleString()}
                .
              </p>
              <label
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={confirmAnyway}
                  onChange={(e) => setConfirmAnyway(e.target.checked)}
                />
                I understand, book this additional appointment anyway
              </label>
            </div>
          )}

          <div>
            <label>Brief description of concern</label>
            <textarea
              name="concern"
              value={form.concern}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={!canSubmit}>
            {submitting ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      )}

      {result && (
        <p
          style={{ color: result.success ? "green" : "red", marginTop: "16px" }}
        >
          {result.message}
        </p>
      )}
      <Link href="/manage" className="manage-link">
  Already booked? Manage your appointment
</Link>
    </main>
  );
}
