import type { AccountingProvider } from "./accountingProvider";

export const isConnected = async (userId: string): Promise<boolean> => {
  return false;
};

export const connect = async (userId: string): Promise<void> => {
  // Stub implementation
};

export const disconnect = async (userId: string): Promise<void> => {
  // Stub implementation
};

export const createInvoice = async (
  userId: string,
  invoice: unknown,
): Promise<unknown> => {
  // Stub implementation
  return null;
};

export const fetchCustomers = async (userId: string): Promise<unknown[]> => {
  // Stub implementation
  return [];
};

export const pushPayment = async (
  userId: string,
  payment: unknown,
): Promise<unknown> => {
  // Stub implementation
  return null;
};

export const quickBooksProvider: AccountingProvider = {
  isConnected,
  connect,
  disconnect,
  createInvoice,
  fetchCustomers,
  pushPayment,
};

export default quickBooksProvider;
