import {supabase} from "@/integrations/supabase/client";
import type {Appointment} from "@/lib/crmSchemas";

const PROVIDER = "showingtime";

interface TokenRow {
    user_id: string;
    provider: string;
    access_token: string;
    refresh_token: string;
    expires_at: string;
}

// Basic token helpers -------------------------------------------------------
async function getToken(userId: string): Promise<TokenRow | null> {
    const {data, error} = await supabase
        .from("calendar_tokens")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", PROVIDER)
        .maybeSingle();

    if (error) {
        console.error("ShowingTime: getToken error", error);
        return null;
    }
    return data as TokenRow;
}

async function saveToken(
    userId: string,
    token: { access_token: string; refresh_token: string; expires_in: number },
) {
    const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
    const {error} = await supabase.from("calendar_tokens").upsert(
        {
            user_id: userId,
            provider: PROVIDER,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_at: expiresAt,
        },
        {onConflict: "user_id,provider"},
    );
    if (error) {
        console.error("ShowingTime: saveToken error", error);
    }
}

export async function handleOAuthCallback(
    userId: string,
    token: { access_token: string; refresh_token: string; expires_in: number },
) {
    await saveToken(userId, token);
}

async function refreshAccessToken(refreshToken: string) {
    const res = await fetch("https://api.showingtime.com/oauth/token", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: import.meta.env.VITE_SHOWINGTIME_CLIENT_ID || "",
            client_secret: import.meta.env.VITE_SHOWINGTIME_CLIENT_SECRET || "",
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

// API helpers ----------------------------------------------------------------
function toAppointment(showing: any, userId: string): Appointment {
    const start = new Date(showing.start_time).toISOString();
    const duration = showing.duration_minutes || 60;
    return {
        id: `showingtime-${showing.id}`,
        user_id: userId,
        title: showing.property_address
            ? `Inspection: ${showing.property_address}`
            : "ShowingTime Inspection",
        description: showing.notes || undefined,
        appointment_date: start,
        duration_minutes: duration,
        location: showing.property_address || undefined,
        status: "scheduled",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contact_id: null,
        report_id: null,
        organization_id: null,
    } as Appointment;
}

export async function refreshEvents(userId: string) {
    const accessToken = await getAccessToken(userId);
    if (!accessToken) return;
    const res = await fetch("https://api.showingtime.com/v3/showings", {
        headers: {Authorization: `Bearer ${accessToken}`},
    });
    if (!res.ok) {
        console.error("ShowingTime: refreshEvents failed", await res.text());
        return;
    }
    const data = await res.json();
    if (!Array.isArray(data?.showings)) return;
    const appointments = data.showings.map((s: any) => toAppointment(s, userId));
    for (const appt of appointments) {
        await supabase.from("appointments").upsert(appt, {onConflict: "id"});
    }
}

export async function isConnected(userId: string): Promise<boolean> {
    const token = await getToken(userId);
    return !!token && new Date(token.expires_at).getTime() > Date.now();
}

export async function connect(userId: string) {
    const redirectUri =
        import.meta.env.VITE_SHOWINGTIME_REDIRECT_URL || window.location.origin;
    const clientId = import.meta.env.VITE_SHOWINGTIME_CLIENT_ID || "";
    const authUrl =
        `https://api.showingtime.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${userId}`;
    window.location.href = authUrl;
}

export async function disconnect(userId: string) {
    await supabase
        .from("calendar_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("provider", PROVIDER);
}

export default {
    connect,
    disconnect,
    isConnected,
    refreshEvents,
    handleOAuthCallback,
};