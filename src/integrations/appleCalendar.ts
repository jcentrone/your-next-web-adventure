import { supabase } from "@/integrations/supabase/client";
import type { Appointment } from "@/lib/crmSchemas";

const PROVIDER = "apple";

interface TokenRow {
  user_id: string;
  provider: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

interface EventRow {
  user_id: string;
  provider: string;
  appointment_id: string;
  event_id: string;
}

async function getToken(userId: string): Promise<TokenRow | null> {
  // Apple Calendar integration disabled - tables not configured
  return null;
}

async function saveToken(userId: string, token: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  // Apple Calendar integration disabled - tables not configured
  console.log("Apple Calendar: saveToken called but not configured");
}

export async function handleOAuthCallback(
  userId: string,
  token: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  },
) {
  await saveToken(userId, token);
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: import.meta.env.VITE_APPLE_CLIENT_ID || "",
      client_secret: import.meta.env.VITE_APPLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

async function getAccessToken(userId: string): Promise<string | null> {
  const token = await getToken(userId);
  if (!token) return null;
  if (new Date(token.expires_at).getTime() < Date.now()) {
    const refreshed = await refreshAccessToken(token.refresh_token);
    if (!refreshed) return null;
    await saveToken(userId, refreshed);
    return refreshed.access_token;
  }
  return token.access_token;
}

function toAppleEvent(appointment: Appointment) {
  const start = new Date(appointment.appointment_date).toISOString();
  const end = new Date(
    new Date(appointment.appointment_date).getTime() +
      (appointment.duration_minutes || 60) * 60000,
  ).toISOString();
  return {
    title: appointment.title,
    notes: appointment.description || "",
    location: appointment.location || "",
    startDate: start,
    endDate: end,
  };
}

async function getEventId(appointmentId: string): Promise<string | null> {
  // Apple Calendar integration disabled - tables not configured
  return null;
}

async function saveEventId(
  appointmentId: string,
  userId: string,
  eventId: string,
) {
  // Apple Calendar integration disabled - tables not configured
  console.log("Apple Calendar: saveEventId called but not configured");
}

export async function createEvent(userId: string, appointment: Appointment) {
  // Apple Calendar integration disabled - tables not configured
  console.log("Apple Calendar: createEvent called but not configured");
}

export async function updateEvent(userId: string, appointment: Appointment) {
  // Apple Calendar integration disabled - tables not configured
  console.log("Apple Calendar: updateEvent called but not configured");
}

export async function deleteEvent(userId: string, appointmentId: string) {
  // Apple Calendar integration disabled - tables not configured
  console.log("Apple Calendar: deleteEvent called but not configured");
}

export async function isConnected(userId: string): Promise<boolean> {
  // Apple Calendar integration disabled - tables not configured
  return false;
}

export async function connect(userId: string) {
  // Apple Calendar integration disabled - tables not configured
  console.log("Apple Calendar: connect called but not configured");
}

export async function disconnect(userId: string) {
  // Apple Calendar integration disabled - tables not configured
  console.log("Apple Calendar: disconnect called but not configured");
}

export async function refreshEvents(userId: string) {
  // Apple Calendar integration disabled - tables not configured
  console.log("Apple Calendar: refreshEvents called but not configured");
}

export default {
  createEvent,
  updateEvent,
  deleteEvent,
  connect,
  disconnect,
  isConnected,
  refreshEvents,
  handleOAuthCallback,
};

