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
  const res = await fetch("https://api.apple.com/calendar/v1/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toAppleEvent(appointment)),
  });
  if (!res.ok) return;
  const data = await res.json();
  await saveEventId(appointment.id, userId, data.id);
}

export async function updateEvent(userId: string, appointment: Appointment) {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return;
  const eventId = await getEventId(appointment.id);
  if (!eventId) return createEvent(userId, appointment);
  await fetch(`https://api.apple.com/calendar/v1/events/${eventId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toAppleEvent(appointment)),
  });
}

export async function deleteEvent(userId: string, appointmentId: string) {
  const accessToken = await getAccessToken(userId);
  if (!accessToken) return;
  const eventId = await getEventId(appointmentId);
  if (!eventId) return;
  await fetch(`https://api.apple.com/calendar/v1/events/${eventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await supabase
    .from("calendar_events")
    .delete()
    .eq("appointment_id", appointmentId)
    .eq("provider", PROVIDER);
}

export async function isConnected(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("calendar_tokens")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", PROVIDER)
    .maybeSingle();

  if (error) {
    console.error("Error checking Apple calendar connection", error);
    return false;
  }

  return data !== null;
}

export async function connect(userId: string) {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_APPLE_CLIENT_ID || "",
    redirect_uri: `${window.location.origin}/oauth/apple`,
    response_type: "code",
    scope: "calendar",
    state: userId,
  });
  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
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
  // Fetch a window of events from the user's primary Apple calendar
  const params = new URLSearchParams({
    startDate: new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 30 days back
    endDate: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 1 year ahead
  });

  const res = await fetch(
    `https://api.apple.com/calendar/v1/events?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) return;

  // Apple calendar responses are assumed to return an array of events
  // under a `data` field. Each event should at minimum contain:
  // id, title, notes, location, startDate, endDate and optional status.
  const { data: items = [] } = await res.json();

  for (const event of items) {
    const startStr = event.startDate;
    if (!startStr) continue;

    const endStr = event.endDate;
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date(start.getTime() + 60 * 60000);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    const { data: existing } = await supabase
      .from<EventRow>("calendar_events")
      .select("appointment_id")
      .eq("event_id", event.id)
      .eq("provider", PROVIDER)
      .eq("user_id", userId)
      .maybeSingle();

    const appointmentData = {
      user_id: userId,
      title: event.title || "Untitled Event",
      description: event.notes || null,
      appointment_date: start.toISOString(),
      duration_minutes: duration,
      location: event.location || null,
      status:
        event.status === "cancelled" || event.status === "CANCELED"
          ? "cancelled"
          : "scheduled",
    };

    let appointmentId = existing?.appointment_id;

    if (appointmentId) {
      await supabase
        .from("appointments")
        .update(appointmentData)
        .eq("id", appointmentId);
    } else {
      const { data: inserted } = await supabase
        .from("appointments")
        .insert(appointmentData)
        .select("id")
        .single();
      if (!inserted) continue;
      appointmentId = inserted.id;
    }

    await supabase.from("calendar_events").upsert({
      appointment_id: appointmentId,
      user_id: userId,
      provider: PROVIDER,
      event_id: event.id,
    });
  }
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

