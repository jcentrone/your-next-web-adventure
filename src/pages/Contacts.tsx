import React, { useState } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactSchema, type Contact } from "@/lib/crmSchemas";
import { useToast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";

const Contacts: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts", user?.id, searchQuery],
    queryFn: () => searchQuery.trim() 
      ? contactsApi.search(user!.id, searchQuery.trim())
      : contactsApi.list(user!.id),
    enabled: !!user,
  });

  const form = useForm<Contact>({
    resolver: zodResolver(ContactSchema.omit({ id: true, user_id: true, created_at: true, updated_at: true })),
    defaultValues: {
      contact_type: "client",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      notes: "",
      is_active: true,
    },
  });

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
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, updates: data });
    } else {
      createMutation.mutate({ ...data, user_id: user!.id });
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    form.reset(contact);
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
        title="Contacts - InspectPro"
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingContact(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? "Edit Contact" : "Add New Contact"}
                </DialogTitle>
                <DialogDescription>
                  {editingContact ? "Update contact information" : "Create a new contact for your business"}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
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
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>ZIP Code</FormLabel>
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingContact ? "Update" : "Create"} Contact
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No contacts found matching your search" : "No contacts yet"}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {contact.first_name} {contact.last_name}
                      </CardTitle>
                      {contact.company && (
                        <CardDescription className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {contact.company}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={getContactTypeColor(contact.contact_type)}>
                      {contact.contact_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${contact.email}`} className="hover:text-primary">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${contact.phone}`} className="hover:text-primary">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {(contact.address || contact.city || contact.state) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {[contact.address, contact.city, contact.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(contact)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Contacts;