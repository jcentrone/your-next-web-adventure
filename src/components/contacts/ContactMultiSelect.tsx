import React from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Contact } from "@/lib/crmSchemas";

interface ContactMultiSelectProps {
  contacts?: Contact[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export const ContactMultiSelect: React.FC<ContactMultiSelectProps> = ({ contacts: contactsProp, value, onChange }) => {
  const { user } = useAuth();
  const { data: fetchedContacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !contactsProp && !!user,
  });

  const contacts = contactsProp ?? fetchedContacts;

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedContacts = contacts.filter((c) => value.includes(c.id));

  return (
    <Command className="h-auto max-h-60 overflow-visible">
      <CommandInput placeholder="Search contacts..." />
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2">
          {selectedContacts.map((c) => (
            <Badge key={c.id} variant="secondary" className="flex items-center gap-1">
              {c.first_name} {c.last_name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggle(c.id)}
              />
            </Badge>
          ))}
        </div>
      )}
      <CommandList>
        <CommandEmpty>No contacts found.</CommandEmpty>
        <CommandGroup>
          {contacts.map((c) => {
            const isSelected = value.includes(c.id);
            return (
              <CommandItem
                key={c.id}
                value={`${c.first_name} ${c.last_name} ${c.email ?? ""}`}
                onSelect={() => toggle(c.id)}
                disabled={!c.email}
                className="flex items-center gap-2"
              >
                <Checkbox
                  checked={isSelected}
                  aria-hidden
                  className="pointer-events-none"
                  disabled={!c.email}
                />
                <span>
                  {c.first_name} {c.last_name}
                  {c.email ? ` (${c.email})` : " (no email)"}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default ContactMultiSelect;

