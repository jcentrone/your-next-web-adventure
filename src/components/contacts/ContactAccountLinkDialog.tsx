import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Link2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { contactsApi } from "@/integrations/supabase/crmApi";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContactAccountLinkDialogProps {
  accountId: string;
  accountName: string;
  trigger?: React.ReactNode;
}

export const ContactAccountLinkDialog: React.FC<ContactAccountLinkDialogProps> = ({
  accountId,
  accountName,
  trigger,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const { data: allContacts = [] } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: () => contactsApi.list(user!.id),
    enabled: !!user && open,
  });

  // Filter contacts that aren't already linked to this account and match search
  const availableContacts = allContacts.filter((contact: any) => {
    const matchesSearch = !searchQuery || 
      `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const notLinkedToAccount = contact.account_id !== accountId;
    
    return matchesSearch && notLinkedToAccount;
  });

  const linkContactsMutation = useMutation({
    mutationFn: async (contactIds: string[]) => {
      const promises = contactIds.map(contactId =>
        contactsApi.update(contactId, { account_id: accountId })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Contacts linked",
        description: `Successfully linked ${selectedContacts.length} contact(s) to ${accountName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["account-contacts", accountId] });
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
      setSelectedContacts([]);
      setSearchQuery("");
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to link contacts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleLinkContacts = () => {
    if (selectedContacts.length > 0) {
      linkContactsMutation.mutate(selectedContacts);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Link2 className="h-4 w-4 mr-2" />
            Link Existing Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Link Contacts to {accountName}</DialogTitle>
          <DialogDescription>
            Search and select existing contacts to link to this account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Contacts Preview */}
          {selectedContacts.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">
                Selected ({selectedContacts.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedContacts.map(contactId => {
                  const contact = allContacts.find((c: any) => c.id === contactId);
                  return contact ? (
                    <Badge key={contactId} variant="secondary">
                      {contact.first_name} {contact.last_name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Available Contacts List */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {availableContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No contacts match your search." : "No available contacts to link."}
                </div>
              ) : (
                availableContacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedContacts.includes(contact.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleToggleContact(contact.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(contact.first_name, contact.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {contact.email}
                      </div>
                      {contact.company && (
                        <div className="text-xs text-muted-foreground">
                          {contact.company}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {contact.contact_type}
                      </Badge>
                      {selectedContacts.includes(contact.id) && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleLinkContacts}
            disabled={selectedContacts.length === 0 || linkContactsMutation.isPending}
          >
            {linkContactsMutation.isPending ? "Linking..." : `Link ${selectedContacts.length} Contact(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactAccountLinkDialog;