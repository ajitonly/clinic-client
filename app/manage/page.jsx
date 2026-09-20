"use client";

import { useState } from "react";
import BookingCalendar from "@/components/BookingCalendar";
import { supabase } from "@/lib/supabaseClient";

export default function ManageAppointmentPage() {
  const [phone, setPhone] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState(null);

  const [mode, setMode] = useState("view"); // 'view' | 'reschedule'
  const [newSlot, setNewSlot] = useState(null);
  const [working, setWorking] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    setSearching(true);
    setNotFound(false);
    setMessage(null);
    setAppointment(null);
    setMode("view");

    const { data, error } = await supabase.rpc("get_my_appointment", {
      p_phone: phone.trim(),
    });

    setSearching(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    if (!data || data.length === 0) {
      setNotFound(true);
      return;
    }

    setAppointment(data[0]);
  }

  async function handleCancel() {
    if (!appointment) return;
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );
    if (!confirmed) return;

    setWorking(true);
    setMessage(null);

    const { data, error } = await supabase.rpc("cancel_my_appointment", {
      p_appt_id: appointment.id,
      p_phone: phone.trim(),
    });

    setWorking(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    if (data === false) {
      setMessage({
        type: "error",
        text: "This appointment can no longer be cancelled (same-day cancellations are not allowed).",
      });
      return;
    }

    setMessage({ type: "success", text: "Appointment cancelled." });
    setAppointment(null);
  }

  function handleNewSlotSelected(date, time) {
    setNewSlot({ date, time });
  }

  async function handleConfirmReschedule() {
    if (!appointment || !newSlot) return;

    setWorking(true);
    setMessage(null);

    const [hours, minutes] = newSlot.time.split(":").map(Number);
    const newDatetime = new Date(newSlot.date);
    newDatetime.setHours(hours, minutes, 0, 0);

    const { data, error } = await supabase.rpc("reschedule_my_appointment", {
      p_appt_id: appointment.id,
      p_phone: phone.trim(),
      p_new_datetime: newDatetime.toISOString(),
    });

    setWorking(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({
      type: "success",
      text: "Appointment rescheduled successfully!",
    });
    setAppointment(null);
    setMode("view");
    setNewSlot(null);
  }

  return (
    <main style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
      <h1>Manage Your Appointment</h1>

      <form onSubmit={handleLookup}>
        <label>Phone Number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit" disabled={searching}>
          {searching ? "Searching..." : "Find My Appointment"}
        </button>
      </form>

      {notFound && <p>No active appointment found for that phone number.</p>}

      {message && (
        <p style={{ color: message.type === "success" ? "green" : "red" }}>
          {message.text}
        </p>
      )}

      {appointment && mode === "view" && (
        <div
          style={{
            marginTop: "16px",
            border: "1px solid #ccc",
            padding: "12px",
          }}
        >
          <p>
            <strong>Date/Time:</strong>{" "}
            {new Date(appointment.appointment_datetime).toLocaleString()}
          </p>
          <p>
            <strong>Concern:</strong> {appointment.concern || "—"}
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button onClick={handleCancel} disabled={working}>
              Cancel Appointment
            </button>
            <button onClick={() => setMode("reschedule")} disabled={working}>
              Reschedule
            </button>
          </div>
        </div>
      )}

      {appointment && mode === "reschedule" && (
        <div style={{ marginTop: "16px" }}>
          <p>Pick a new date and time:</p>
          <BookingCalendar onSlotSelected={handleNewSlotSelected} />

          {newSlot && (
            <p>
              New slot: {newSlot.date.toDateString()} at {newSlot.time}
            </p>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              onClick={handleConfirmReschedule}
              disabled={!newSlot || working}
            >
              {working ? "Rescheduling..." : "Confirm New Time"}
            </button>
            <button onClick={() => setMode("view")} disabled={working}>
              Back
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
