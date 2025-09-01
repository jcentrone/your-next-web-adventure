import { supabase } from "@/integrations/supabase/client";
import type { Appointment } from "@/lib/crmSchemas";

const PROVIDER = "google";

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
  const { data } = await supabase
    .from<TokenRow>("calendar_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", PROVIDER)
    .maybeSingle();
  return data ?? null;
}

async function saveToken(userId: string, token: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  await supabase.from("calendar_tokens").upsert({
    user_id: userId,
    provider: PROVIDER,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
  });
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
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

function toGCalEvent(appointment: Appointment) {
  const start = new Date(appointment.appointment_date).toISOString();
  const end = new Date(
    new Date(appointment.appointment_date).getTime() +
      (appointment.duration_minutes || 60) * 60000,
  ).toISOString();
  return {
    summary: appointment.title,
    description: appointment.description || undefined,
    location: appointment.location || undefined,
    start: { dateTime: start },
    end: { dateTime: end },
  };
}

async function getEventId(appointmentId: string): Promise<string | null> {
  const { data } = await supabase
    .from<EventRow>("calendar_events")
    .select("event_id")
    .eq("appointment_id", appointmentId)
    .eq("provider", PROVIDER)
    .maybeSingle();
  return data?.event_id || null;
}

async function saveEventId(
  appointmentId: string,
  userId: string,
  eventId: string,
) {
  await supabase.from("calendar_events").upsert({
    appointment_id: appointmentId,
    user_id: userId,
    provider: PROVIDER,
    event_id: eventId,
  });
}

export async function createEvent(userId: string, appointment: Appointment) {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return;
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toGCalEvent(appointment)),
    },
  );
  if (!res.ok) return;
  const data = await res.json();
  await saveEventId(appointment.id, userId, data.id);
}

export async function updateEvent(userId: string, appointment: Appointment) {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return;
  const eventId = await getEventId(appointment.id);
  if (!eventId) return createEvent(userId, appointment);
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toGCalEvent(appointment)),
    },
  );
}

export async function deleteEvent(userId: string, appointmentId: string) {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return;
  const eventId = await getEventId(appointmentId);
  if (!eventId) return;
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  await supabase
    .from("calendar_events")
    .delete()
    .eq("appointment_id", appointmentId)
    .eq("provider", PROVIDER);
}

export async function isConnected(userId: string) {
  const { data } = await supabase
    .from("calendar_tokens")
    .select("id")
    .eq("user_id", userId)
    .eq("provider", PROVIDER)
    .maybeSingle();
  return !!data;
}

export async function connect(userId: string) {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    redirect_uri: `${window.location.origin}/oauth/google`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar",
    access_type: "offline",
    prompt: "consent",
    state: userId,
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function disconnect(userId: string) {
  await supabase
    .from("calendar_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("provider", PROVIDER);
}

export async function refreshEvents(userId: string) {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return;
  // This function can be invoked by a scheduled job or webhook
  // to keep events in sync between systems.
}

export default {
  createEvent,
  updateEvent,
  deleteEvent,
  connect,
  disconnect,
  isConnected,
  refreshEvents,
};

