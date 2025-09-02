// Temporary stub for ShowingTime integration until calendar_tokens table types are available
export const createEvent = async (userId: string, appointment: any) => {
  // Stub implementation
};

export const updateEvent = async (userId: string, appointment: any) => {
  // Stub implementation
};

export const deleteEvent = async (userId: string, appointmentId: string) => {
  // Stub implementation
};

export async function isConnected(userId: string): Promise<boolean> {
  return false;
}

export async function connect(userId: string) {
  // Stub implementation
}

export async function disconnect(userId: string) {
  // Stub implementation
}

export async function refreshEvents(userId: string) {
  // Stub implementation
}

export async function handleOAuthCallback(
  userId: string,
  token: { access_token: string; refresh_token: string; expires_in: number },
) {
  // Stub implementation
}

export default {
  connect,
  disconnect,
  isConnected,
  refreshEvents,
  handleOAuthCallback,
};