import React from "react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Appointment } from "@/lib/crmSchemas";

interface TimeChangeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  newDate: Date | null;
  onConfirm: (changeTime: boolean) => void;
}

export const TimeChangeConfirmDialog: React.FC<TimeChangeConfirmDialogProps> = ({
  open,
  onOpenChange,
  appointment,
  newDate,
  onConfirm,
}) => {
  if (!appointment || !newDate) return null;

  const originalDate = new Date(appointment.appointment_date);
  const isSameTime = originalDate.getHours() === newDate.getHours() && 
                    originalDate.getMinutes() === newDate.getMinutes();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Appointment Time?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              You've moved <strong>{appointment.title}</strong> from{" "}
              <strong>{format(originalDate, "EEEE, MMMM d, yyyy")}</strong> to{" "}
              <strong>{format(newDate, "EEEE, MMMM d, yyyy")}</strong>.
            </div>
            
            {!isSameTime && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <div><strong>Original time:</strong> {format(originalDate, "h:mm a")}</div>
                  <div><strong>New time slot:</strong> {format(newDate, "h:mm a")}</div>
                </div>
              </div>
            )}
            
            <div>
              Do you want to change the appointment time?
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onConfirm(false)}>
            Keep Original Time
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(true)}>
            Change Time
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};