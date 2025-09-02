import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export const useToastNotifications = () => {
  const { toast } = useToast();

  const showSuccess = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 4000,
    });
  }, [toast]);

  const showError = useCallback((message: string, description?: string) => {
    toast({
      variant: "destructive",
      title: message,
      description,
      duration: 6000,
    });
  }, [toast]);

  const showWarning = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 5000,
    });
  }, [toast]);

  const showInfo = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 4000,
    });
  }, [toast]);

  // Common toast messages for CRUD operations
  const showCreateSuccess = useCallback((entity: string) => {
    showSuccess(`${entity} created successfully`);
  }, [showSuccess]);

  const showUpdateSuccess = useCallback((entity: string) => {
    showSuccess(`${entity} updated successfully`);
  }, [showSuccess]);

  const showDeleteSuccess = useCallback((entity: string) => {
    showSuccess(`${entity} deleted successfully`);
  }, [showSuccess]);

  const showCreateError = useCallback((entity: string, error?: string) => {
    showError(`Failed to create ${entity}`, error);
  }, [showError]);

  const showUpdateError = useCallback((entity: string, error?: string) => {
    showError(`Failed to update ${entity}`, error);
  }, [showError]);

  const showDeleteError = useCallback((entity: string, error?: string) => {
    showError(`Failed to delete ${entity}`, error);
  }, [showError]);

  const showLoadingError = useCallback((entity: string, error?: string) => {
    showError(`Failed to load ${entity}`, error);
  }, [showError]);

  // Authentication toasts
  const showSignInSuccess = useCallback(() => {
    showSuccess("Welcome back!", "You've successfully signed in.");
  }, [showSuccess]);

  const showSignOutSuccess = useCallback(() => {
    showSuccess("Signed out successfully", "See you next time!");
  }, [showSuccess]);

  const showAuthError = useCallback((error: string) => {
    showError("Authentication failed", error);
  }, [showError]);

  // Network-related toasts
  const showOfflineWarning = useCallback(() => {
    showWarning("You're offline", "Changes will sync when connection is restored.");
  }, [showWarning]);

  const showOnlineSuccess = useCallback(() => {
    showSuccess("Connection restored", "Syncing your changes now.");
  }, [showSuccess]);

  const showSyncError = useCallback(() => {
    showError("Sync failed", "Some changes couldn't be saved. Please try again.");
  }, [showError]);

  return {
    // Basic toast functions
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // CRUD operations
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess,
    showCreateError,
    showUpdateError,
    showDeleteError,
    showLoadingError,
    
    // Authentication
    showSignInSuccess,
    showSignOutSuccess,
    showAuthError,
    
    // Network
    showOfflineWarning,
    showOnlineSuccess,
    showSyncError,
  };
};