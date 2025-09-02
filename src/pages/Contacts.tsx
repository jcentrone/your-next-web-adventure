import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Mail, Phone, Building, MapPin, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema, CreateContactSchema, type Contact } from "@/lib/crmSchemas";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import { useToast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import { ContactsViewToggle } from "@/components/contacts/ContactsViewToggle";
import { ContactsListView } from "@/components/contacts/ContactsListView";
import { ContactsCardView } from "@/components/contacts/ContactsCardView";
import { ContactsFilter } from "@/components/contacts/ContactsFilter";

const Contacts: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [view, setView] = useState<"list" | "card">("list");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts", user?.id, searchQuery],
    queryFn: () => searchQuery.trim() 
      ? contactsApi.search(user!.id, searchQuery.trim())
      : contactsApi.list(user!.id),
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(CreateContactSchema),
    defaultValues: {
      contact_type: "client",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      formatted_address: "",
      place_id: "",
      latitude: undefined,
      longitude: undefined,
      address_components: undefined,
      city: "",
      state: "",
      zip_code: "",
      notes: "",
      is_active: true,
    },
  });

  // Filter and sort contacts
  const filteredAndSortedContacts = React.useMemo(() => {
    let filtered = contacts?.filter(contact => {
      const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = fullName.includes(query) || 
             contact.email?.toLowerCase().includes(query) ||
             contact.phone?.includes(query) ||
             contact.company?.toLowerCase().includes(query);
      
      const matchesType = !selectedType || contact.contact_type === selectedType;
      
      return matchesSearch && matchesType;
    }) || [];

    // Sort contacts
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case "name":
            aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
            bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
            break;
          case "contact_type":
            aValue = a.contact_type?.toLowerCase() || "";
            bValue = b.contact_type?.toLowerCase() || "";
            break;
          case "company":
            aValue = a.company?.toLowerCase() || "";
            bValue = b.company?.toLowerCase() || "";
            break;
          case "location":
            aValue = `${a.city || ""} ${a.state || ""}`.toLowerCase().trim();
            bValue = `${b.city || ""} ${b.state || ""}`.toLowerCase().trim();
            break;
          default:
            return 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === "asc" ? comparison : -comparison;
        }
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [contacts, searchQuery, selectedType, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const createMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Contact created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error creating contact", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Contact> }) =>
      contactsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Contact updated successfully" });
      setIsDialogOpen(false);
      setEditingContact(null);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error updating contact", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contactsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Contact deleted successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting contact", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    console.log('Editing contact:', editingContact);
    
    if (editingContact) {
      console.log('Updating contact:', editingContact.id);
      updateMutation.mutate({ id: editingContact.id, updates: data });
    } else {
      console.log('Creating new contact');
      const contactData = { 
        ...data, 
        user_id: user!.id,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        formatted_address: data.formatted_address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
        notes: data.notes || null,
      };
      console.log('Contact data to create:', contactData);
      createMutation.mutate(contactData);
    }
  };

  const handleEdit = (contact: Contact) => {
    console.log('Editing contact:', contact);
    setEditingContact(contact);
    form.reset({
      contact_type: contact.contact_type,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      formatted_address: contact.formatted_address || "",
      place_id: contact.place_id || "",
      latitude: contact.latitude,
      longitude: contact.longitude,
      address_components: contact.address_components,
      city: contact.city || "",
      state: contact.state || "",
      zip_code: contact.zip_code || "",
      notes: contact.notes || "",
      is_active: contact.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (contact: Contact) => {
    if (confirm(`Are you sure you want to delete ${contact.first_name} ${contact.last_name}?`)) {
      deleteMutation.mutate(contact.id);
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case "client":
        return "bg-blue-100 text-blue-800";
      case "realtor":
        return "bg-green-100 text-green-800";
      case "vendor":
        return "bg-purple-100 text-purple-800";
      case "contractor":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Seo 
        title="Contacts - Home Report Pro"
        description="Manage your clients, realtors, and business contacts in one place."
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your clients, realtors, and business contacts.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <ContactsViewToggle view={view} onViewChange={setView} />
            <Button onClick={() => navigate("/contacts/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md max-h-[85vh] p-0">
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Update contact information
                </DialogDescription>
              </DialogHeader>
              
              <div className="px-6 pb-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">First Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-8" />
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
                            <FormLabel className="text-xs">Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-8" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} className="h-8" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Phone</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-8" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="contact_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Contact Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-8">
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
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Company</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-8" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="formatted_address"
                      render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-xs">Address</FormLabel>
                           <FormControl>
                              <AddressAutocomplete
                                value={field.value}
                                onAddressChange={(addressData) => {
                                  console.log('Address selected:', addressData);
                                  // Update the display field and all related fields when address selection is made
                                  field.onChange(addressData.formatted_address);
                                  form.setValue('place_id', addressData.place_id);
                                  form.setValue('latitude', addressData.latitude);
                                  form.setValue('longitude', addressData.longitude);
                                  form.setValue('address_components', addressData.address_components);
                                  
                                  // Extract city, state, zip from address components if available
                                  const components = addressData.address_components || [];
                                  let city = '';
                                  let state = '';
                                  let zipCode = '';

                                  components.forEach((component: any) => {
                                    const types = component.types || [];
                                    if (types.includes('locality')) {
                                      city = component.long_name;
                                    } else if (types.includes('administrative_area_level_1')) {
                                      state = component.short_name;
                                    } else if (types.includes('postal_code')) {
                                      zipCode = component.long_name;
                                    }
                                  });

                                  if (city) form.setValue('city', city);
                                  if (state) form.setValue('state', state);
                                  if (zipCode) form.setValue('zip_code', zipCode);
                                }}
                                onInputChange={(value) => {
                                 console.log('Input changed (typing):', value);
                                 // Update form field only for typed input, preserving smooth typing
                                 field.onChange(value);
                               }}
                                placeholder="Start typing address..."
                                className="h-8"
                              />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">City</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-8" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">State</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-8" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zip_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-8" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={2} 
                              className="resize-none text-sm"
                              placeholder="Additional notes..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        className="h-8 px-3"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="h-8 px-3"
                      >
                        {createMutation.isPending || updateMutation.isPending 
                          ? "Saving..." 
                          : editingContact ? "Update" : "Create"} Contact
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ContactsFilter
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            getContactTypeColor={getContactTypeColor}
          />
        </div>

        {/* Contacts Display */}
        {isLoading ? (
          <div className="text-center py-8">Loading contacts...</div>
        ) : filteredAndSortedContacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedType ? "No contacts found matching your criteria" : "No contacts yet"}
              </p>
              <Button onClick={() => navigate("/contacts/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          view === "list" ? (
            <ContactsListView
              contacts={filteredAndSortedContacts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getContactTypeColor={getContactTypeColor}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          ) : (
            <ContactsCardView
              contacts={filteredAndSortedContacts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              getContactTypeColor={getContactTypeColor}
            />
          )
        )}
      </div>
    </>
  );
};

export default Contacts;