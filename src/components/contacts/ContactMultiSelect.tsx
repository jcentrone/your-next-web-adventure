import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/contexts/AuthContext";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@/lib/crmSchemas";
import { CreateContactSchema } from "@/lib/crmSchemas";

interface ContactMultiSelectProps {
  contacts?: Contact[];
  value: string[];
  onChange: (ids: string[]) => void;
  onSelectedContactsChange?: (contacts: Contact[]) => void;
}

export const ContactMultiSelect: React.FC<ContactMultiSelectProps> = ({
  contacts: contactsProp,
  value,
  onChange,
  onSelectedContactsChange,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: fetchedContacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !contactsProp && !!user,
  });

  const contacts = contactsProp ?? fetchedContacts;

  const form = useForm({
    resolver: zodResolver(CreateContactSchema),
    defaultValues: {
      contact_type: "client",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      is_active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Contact created successfully" });
      setShowCreateDialog(false);
      form.reset();
      // Auto-select the newly created contact
      onChange([...value, newContact.id]);
    },
    onError: (error) => {
      toast({ 
        title: "Error creating contact", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedContacts = React.useMemo(
    () => contacts.filter((c) => value.includes(c.id)),
    [contacts, value]
  );

  React.useEffect(() => {
    onSelectedContactsChange?.(selectedContacts);
  }, [onSelectedContactsChange, selectedContacts]);

  const onSubmit = (data: any) => {
    const contactData = { 
      ...data, 
      user_id: user!.id,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
    };
    createMutation.mutate(contactData);
  };

  const getContactTypeColor = (type: string): string => {
    switch (type) {
      case "client": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "realtor": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "vendor": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "contractor": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected contacts display */}
      {selectedContacts.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedContacts.map((c) => (
            <Badge key={c.id} variant="secondary" className="flex items-center gap-1">
              {c.first_name} {c.last_name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => toggle(c.id)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown trigger and content */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedContacts.length > 0 
              ? `${selectedContacts.length} contact(s) selected`
              : "Select contacts..."
            }
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          {/* Add New Contact button */}
          <div className="p-2 border-b">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Contact</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contact_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="realtor">Realtor</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="contractor">Contractor</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Contact search and selection */}
          <Command className="border-0">
            <CommandInput placeholder="Search contacts..." />
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
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1">
                          <div className="font-medium">
                            {c.first_name} {c.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {c.email || "No email"}
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getContactTypeColor(c.contact_type)}`}
                        >
                          {c.contact_type}
                        </Badge>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ContactMultiSelect;

