import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { CreateContactSchema, type Contact } from "@/lib/crmSchemas";
import { z } from "zod";
import { AddressAutocomplete } from "@/components/maps/AddressAutocomplete";
import { useToast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import { ContactsViewToggle } from "@/components/contacts/ContactsViewToggle";
import { ContactsListView } from "@/components/contacts/ContactsListView";
import { ContactsCardView } from "@/components/contacts/ContactsCardView";
import { ContactsFilter } from "@/components/contacts/ContactsFilter";
import { TagInput } from "@/components/ui/TagInput";
import { ManageTagsDialog } from "@/components/modals/ManageTagsDialog";
import { contactsTagsApi } from "@/integrations/supabase/contactsTagsApi";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Contacts: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [view, setView] = useState<"list" | "card">("list");
  const effectiveView = isMobile ? "card" : view;
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts", user?.id, searchQuery],
    queryFn: () => searchQuery.trim() 
      ? contactsApi.search(user!.id, searchQuery.trim())
      : contactsApi.list(user!.id),
    enabled: !!user,
  });

  React.useEffect(() => {
    if (!user) return;
    const loadTags = async () => {
      try {
        const tags = await contactsTagsApi.list();
        setTagSuggestions(tags.map((t) => t.name));
      } catch (error) {
        console.error("Error loading tag suggestions:", error);
      }
    };
    loadTags();
  }, [user]);

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
      const matchesTags =
        tagFilter.length === 0 ||
        tagFilter.every((tag) => contact.tags?.includes(tag));

      return matchesSearch && matchesType && matchesTags;
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
  }, [contacts, searchQuery, selectedType, tagFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedContacts.length / itemsPerPage) || 1;
  const paginatedContacts = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedContacts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedContacts, currentPage, itemsPerPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchQuery, selectedType, sortField, sortDirection]);

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

  const onSubmit = (data: z.infer<typeof CreateContactSchema>) => {
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, updates: data });
    } else {
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
      createMutation.mutate(contactData);
    }
  };

  const handleEdit = (contact: Contact) => {
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

  const handleManageTags = (contact: Contact) => {
    setSelectedContact(contact);
    setTagDialogOpen(true);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="Contacts - Home Report Pro"
        description="Manage your clients, realtors, and business contacts in one place."
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Mobile Header */}
        {isMobile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">Contacts</h1>
              <Button onClick={() => navigate("/contacts/new")} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Manage your clients, realtors, and business contacts.
            </p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col gap-2">
              <ContactsFilter
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                getContactTypeColor={getContactTypeColor}
              />
              <TagInput
                value={tagFilter}
                onChange={setTagFilter}
                placeholder="Filter tags"
                className="max-w-sm"
                suggestions={tagSuggestions}
              />
            </div>
          </div>
        ) : (
          /* Desktop Header */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                <p className="text-muted-foreground">
                  Manage your clients, realtors, and business contacts.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {!isMobile && <ContactsViewToggle view={view} onViewChange={setView} />}
                <Button onClick={() => navigate("/contacts/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                <TagInput
                  value={tagFilter}
                  onChange={setTagFilter}
                  placeholder="Filter tags"
                  className="max-w-xs"
                  suggestions={tagSuggestions}
                />
              </div>
            </div>
          </div>
        )}

        {filteredAndSortedContacts.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "No contacts match your search criteria." : "Get started by creating your first contact."}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link to="/contacts/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : effectiveView === "list" ? (
          <ContactsListView
            contacts={paginatedContacts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onManageTags={handleManageTags}
            getContactTypeColor={getContactTypeColor}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
        ) : (
          <ContactsCardView
            contacts={paginatedContacts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onManageTags={handleManageTags}
            getContactTypeColor={getContactTypeColor}
          />
        )}

        {filteredAndSortedContacts.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 ps-2">
              <span className="text-sm w-[100px]">Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({length: totalPages}).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      {selectedContact && (
        <ManageTagsDialog
          open={tagDialogOpen}
          onOpenChange={(open) => {
            setTagDialogOpen(open);
            if (!open) setSelectedContact(null);
          }}
          module="contacts"
          recordId={selectedContact.id}
          initialTags={selectedContact.tags || []}
          onTagsUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
          }}
        />
      )}
    </>
  );
};

export default Contacts;