export interface AccountingProvider {
  isConnected(userId: string): Promise<boolean>;
  connect(userId: string): Promise<void>;
  disconnect(userId: string): Promise<void>;
  createInvoice(userId: string, invoice: unknown): Promise<unknown>;
  fetchCustomers?(userId: string): Promise<unknown[]>;
  pushPayment?(userId: string, payment: unknown): Promise<unknown>;
}
