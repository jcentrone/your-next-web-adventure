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
  const { data, error } = await supabase
    .from("calendar_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", PROVIDER)
    .maybeSingle();

  if (error) {
    console.error("Google Calendar: getToken error", error);
    return null;
  }
  return data as TokenRow;
}

async function saveToken(
  userId: string,
  token: { access_token: string; refresh_token: string; expires_in: number },
) {
  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
  const { error } = await supabase.from("calendar_tokens").upsert(
    {
      user_id: userId,
      provider: PROVIDER,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: expiresAt,
    },
    { onConflict: "user_id,provider" },
  );

  if (error) {
    console.error("Google Calendar: saveToken error", error);
  }
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

  if (new Date(token.expires_at).getTime() <= Date.now()) {
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
  const { data, error } = await supabase
    .from("calendar_events")
    .select("event_id")
    .eq("appointment_id", appointmentId)
    .eq("provider", PROVIDER)
    .maybeSingle();

  if (error) {
    console.error("Google Calendar: getEventId error", error);
    return null;
  }
  return data?.event_id ?? null;
}

async function saveEventId(
  appointmentId: string,
  userId: string,
  eventId: string,
) {
  const { error } = await supabase.from("calendar_events").upsert(
    {
      appointment_id: appointmentId,
      user_id: userId,
      provider: PROVIDER,
      event_id: eventId,
    },
    { onConflict: "appointment_id,provider" },
  );

  if (error) {
    console.error("Google Calendar: saveEventId error", error);
  }
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
  if (!res.ok) {
    console.error("Google Calendar: createEvent failed", await res.text());
    return;
  }
  const data = await res.json();
  await saveEventId(appointment.id, userId, data.id);
}

export async function updateEvent(userId: string, appointment: Appointment) {
  const accessToken = await getAccessToken(userId);
  const eventId = await getEventId(appointment.id);
  if (!accessToken || !eventId) return;
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toGCalEvent(appointment)),
    },
  );
  if (!res.ok) {
    console.error("Google Calendar: updateEvent failed", await res.text());
  }
}

export async function deleteEvent(userId: string, appointmentId: string) {
  const accessToken = await getAccessToken(userId);
  const eventId = await getEventId(appointmentId);
  if (!accessToken || !eventId) return;
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok) {
    console.error("Google Calendar: deleteEvent failed", await res.text());
  }
  await supabase
    .from("calendar_events")
    .delete()
    .eq("appointment_id", appointmentId)
    .eq("provider", PROVIDER);
}

export async function isConnected(userId: string): Promise<boolean> {
  const token = await getToken(userId);
  return !!token && new Date(token.expires_at).getTime() > Date.now();
}

export async function connect(userId: string) {
  const redirectUri =
    import.meta.env.VITE_GOOGLE_REDIRECT_URL || window.location.origin;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/calendar.events",
  );
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent&state=${userId}`;
  window.location.href = authUrl;
}

export async function disconnect(userId: string) {
  await supabase
    .from("calendar_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("provider", PROVIDER);
  await supabase
    .from("calendar_events")
    .delete()
    .eq("user_id", userId)
    .eq("provider", PROVIDER);
}

export async function refreshEvents(userId: string) {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return;
  // Basic fetch to ensure token is valid. Parsing of events can be added later.
  await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=1",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  ).catch((err) => console.error("Google Calendar: refreshEvents error", err));
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