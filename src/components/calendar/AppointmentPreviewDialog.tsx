import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, User, FileText, Phone, Mail, Building2, Hash, Calendar } from "lucide-react";
import { type Appointment } from "@/lib/crmSchemas";

interface AppointmentPreviewDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: {
    first_name: string; 
    last_name: string;
    email?: string;
    phone?: string;
    company?: string;
  } | null;
  onNavigate: (path: string) => void;
}

const AppointmentPreviewDialog: React.FC<AppointmentPreviewDialogProps> = ({
  appointment,
  isOpen,
  onOpenChange,
  contact,
  onNavigate,
}) => {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{appointment.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(appointment.status)} variant="secondary">
              {appointment.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="text-sm text-muted-foreground">
              ID: {appointment.id.split('-')[0]}...
            </div>
          </div>

          <Separator />

          {/* Date & Time Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date & Time
            </h3>
            <div className="pl-6 space-y-2">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {format(new Date(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(appointment.appointment_date), "h:mm a")}
                  </p>
                </div>
              </div>
              
              {appointment.duration_minutes && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Duration: {formatDuration(appointment.duration_minutes)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Section */}
          {appointment.location && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </h3>
                <div className="pl-6">
                  <p className="text-sm">{appointment.location}</p>
                </div>
              </div>
            </>
          )}

          {/* Contact Section */}
          {contact && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="pl-6 space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{contact.first_name} {contact.last_name}</span>
                  </div>
                  
                  {contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  
                  {contact.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{contact.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Description Section */}
          {appointment.description && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description
                </h3>
                <div className="pl-6">
                  <p className="text-sm whitespace-pre-wrap">{appointment.description}</p>
                </div>
              </div>
            </>
          )}

          {/* Additional Details */}
          {(appointment.report_id || appointment.created_at || appointment.updated_at) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Additional Details
                </h3>
                <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                  {appointment.report_id && (
                    <div>
                      <span className="font-medium">Linked Report:</span> {appointment.report_id.split('-')[0]}...
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span> {format(new Date(appointment.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                  {appointment.updated_at !== appointment.created_at && (
                    <div>
                      <span className="font-medium">Last Updated:</span> {format(new Date(appointment.updated_at), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />
          <div className="flex justify-end">
            {appointment.report_id ? (
              <Button onClick={() => onNavigate(`/reports/${appointment.report_id}`)}>
                View Report
              </Button>
            ) : (
              <Button onClick={() => onNavigate(`/reports/new/home-inspection?appointmentId=${appointment.id}`)}>
                Create Report
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentPreviewDialog;
