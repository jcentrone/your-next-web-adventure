import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { useAuth } from "@/contexts/AuthContext";

interface ContactLookupProps {
  value?: string;
  onChange: (id: string, contact?: any) => void;
}

export const ContactLookup: React.FC<ContactLookupProps> = ({ value, onChange }) => {
  const { user } = useAuth();
  const nav = useNavigate();

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !!user,
  });

  return (
    <Select
      value={value}
      onValueChange={(contactId) => {
        if (contactId === "add-new") {
          nav("/contacts/new");
          return;
        }
        const selectedContact = contacts.find((c: any) => c.id === contactId);
        onChange(contactId, selectedContact);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a contact or add new...">
          {value && contacts.length > 0 ? (() => {
            const contact = contacts.find((c: any) => c.id === value);
            return contact ? `${contact.first_name} ${contact.last_name}` : value;
          })() : "Select a contact or add new..."}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="add-new" className="font-medium text-primary">
          + Add New Contact
        </SelectItem>
        {contacts.map((contact: any) => (
          <SelectItem key={contact.id} value={contact.id}>
            {contact.first_name} {contact.last_name}
            {contact.email && (
              <span className="text-muted-foreground ml-2">({contact.email})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ContactLookup;
