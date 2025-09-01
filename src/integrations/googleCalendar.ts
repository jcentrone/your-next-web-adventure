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

// Google Calendar integration disabled - tables not configured
async function getToken(userId: string): Promise<TokenRow | null> {
  return null;
}

async function saveToken(userId: string, token: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  console.log("Google Calendar: saveToken called but not configured");
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
  return null;
}

async function getAccessToken(userId: string): Promise<string | null> {
  return null;
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
  return null;
}

async function saveEventId(
  appointmentId: string,
  userId: string,
  eventId: string,
) {
  console.log("Google Calendar: saveEventId called but not configured");
}

export async function createEvent(userId: string, appointment: Appointment) {
  console.log("Google Calendar: createEvent called but not configured");
}

export async function updateEvent(userId: string, appointment: Appointment) {
  console.log("Google Calendar: updateEvent called but not configured");
}

export async function deleteEvent(userId: string, appointmentId: string) {
  console.log("Google Calendar: deleteEvent called but not configured");
}

export async function isConnected(userId: string): Promise<boolean> {
  return false;
}

export async function connect(userId: string) {
  console.log("Google Calendar: connect called but not configured");
}

export async function disconnect(userId: string) {
  console.log("Google Calendar: disconnect called but not configured");
}

export async function refreshEvents(userId: string) {
  console.log("Google Calendar: refreshEvents called but not configured");
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