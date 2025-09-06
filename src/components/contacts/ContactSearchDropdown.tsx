import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Contact } from "@/lib/crmSchemas";

interface ContactSearchDropdownProps {
  contacts?: Contact[];
  value: string[];
  onChange: (ids: string[]) => void;
  onSelectedContactsChange?: (contacts: Contact[]) => void;
  placeholder?: string;
}

export const ContactSearchDropdown: React.FC<ContactSearchDropdownProps> = ({
  contacts: contactsProp,
  value,
  onChange,
  onSelectedContactsChange,
  placeholder = "Select contacts...",
}) => {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);

  const { data: fetchedContacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !contactsProp && !!user,
  });

  const contacts = contactsProp ?? fetchedContacts;

  const selectedContacts = React.useMemo(
    () => contacts.filter((c) => value.includes(c.id)),
    [contacts, value]
  );

  React.useEffect(() => {
    onSelectedContactsChange?.(selectedContacts);
  }, [onSelectedContactsChange, selectedContacts]);

  const toggleContact = (contactId: string) => {
    if (value.includes(contactId)) {
      onChange(value.filter((id) => id !== contactId));
    } else {
      onChange([...value, contactId]);
    }
  };

  const removeContact = (contactId: string) => {
    onChange(value.filter((id) => id !== contactId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[2.5rem] h-auto"
          >
            <div className="flex flex-wrap gap-1">
              {selectedContacts.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedContacts.slice(0, 2).map((contact) => (
                  <Badge
                    key={contact.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {contact.first_name} {contact.last_name}
                  </Badge>
                ))
              )}
              {selectedContacts.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedContacts.length - 2} more
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search contacts..." />
            <CommandList>
              <CommandEmpty>No contacts found.</CommandEmpty>
              <CommandGroup>
                {contacts.map((contact) => {
                  const isSelected = value.includes(contact.id);
                  return (
                    <CommandItem
                      key={contact.id}
                      value={`${contact.first_name} ${contact.last_name} ${contact.email ?? ""}`}
                      onSelect={() => toggleContact(contact.id)}
                      disabled={!contact.email}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </div>
                        {contact.email && (
                          <div className="text-sm text-muted-foreground">
                            {contact.email}
                          </div>
                        )}
                        {!contact.email && (
                          <div className="text-sm text-muted-foreground">
                            (no email)
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected contacts with remove option */}
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedContacts.map((contact) => (
            <Badge key={contact.id} variant="secondary" className="flex items-center gap-1">
              {contact.first_name} {contact.last_name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeContact(contact.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};