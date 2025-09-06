import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, X, Mail, Phone, Building, Users } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContactMultiSelect } from "@/components/contacts/ContactMultiSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Contact } from "@/lib/crmSchemas";

interface ReportContactCardsProps {
  contactIds: string[];
  onContactsChange?: (contactIds: string[]) => void;
  readOnly?: boolean;
}

const getContactTypeColor = (type: string) => {
  switch (type) {
    case "client":
      return "bg-primary/10 text-primary border-primary/20";
    case "agent":
      return "bg-secondary/10 text-secondary-foreground border-secondary/20";
    case "inspector":
      return "bg-accent/10 text-accent-foreground border-accent/20";
    default:
      return "bg-muted/10 text-muted-foreground border-muted/20";
  }
};

export const ReportContactCards: React.FC<ReportContactCardsProps> = ({
  contactIds,
  onContactsChange,
  readOnly = false,
}) => {
  const { user } = useAuth();
  const [isAddingContact, setIsAddingContact] = React.useState(false);
  const [tempSelectedIds, setTempSelectedIds] = React.useState<string[]>([]);

  const { data: allContacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !!user,
  });

  const selectedContacts = React.useMemo(
    () => allContacts.filter((c) => contactIds.includes(c.id)),
    [allContacts, contactIds]
  );

  const handleRemoveContact = (contactId: string) => {
    if (onContactsChange) {
      onContactsChange(contactIds.filter(id => id !== contactId));
    }
  };

  const handleAddContacts = () => {
    if (onContactsChange) {
      const newIds = [...new Set([...contactIds, ...tempSelectedIds])];
      onContactsChange(newIds);
    }
    setTempSelectedIds([]);
    setIsAddingContact(false);
  };

  const getInitials = (contact: Contact) => {
    return `${contact.first_name?.charAt(0) || ''}${contact.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  if (contactIds.length === 0 && readOnly) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No contacts assigned to this report</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Report Attendees</h3>
        {!readOnly && (
          <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Contacts to Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <ContactMultiSelect
                  contacts={allContacts}
                  value={tempSelectedIds}
                  onChange={setTempSelectedIds}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingContact(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddContacts} disabled={tempSelectedIds.length === 0}>
                    Add {tempSelectedIds.length} Contact{tempSelectedIds.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedContacts.map((contact) => (
          <Card key={contact.id} className="relative group">
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 p-0"
                onClick={() => handleRemoveContact(contact.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(contact)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {contact.first_name} {contact.last_name}
                  </CardTitle>
                  <Badge variant="secondary" className={`text-xs ${getContactTypeColor(contact.contact_type)}`}>
                    {contact.contact_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {contact.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{contact.phone}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{contact.company}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};