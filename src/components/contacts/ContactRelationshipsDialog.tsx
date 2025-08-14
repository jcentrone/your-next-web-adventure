import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { crmApi } from '@/integrations/supabase/crmApi';
import { supabase } from '@/integrations/supabase/client';
import { CreateContactRelationshipSchema, type CreateContactRelationship } from '@/lib/contactRelationshipSchemas';

interface ContactRelationshipsDialogProps {
  contactId: string;
  contactName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactRelationshipsDialog({
  contactId,
  contactName,
  open,
  onOpenChange
}: ContactRelationshipsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<CreateContactRelationship>({
    resolver: zodResolver(CreateContactRelationshipSchema),
    defaultValues: {
      relationship_type: "client-realtor",
      custom_relationship_label: "",
      notes: "",
    },
  });

  // Fetch existing relationships
  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ['contact-relationships', contactId],
    queryFn: () => crmApi.contactRelationships.getByContactId(contactId),
    enabled: open,
  });

  // Fetch all contacts for selection
  const { data: allContacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return crmApi.contacts.list(user.id);
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContactRelationship) => 
      crmApi.contactRelationships.create({
        from_contact_id: contactId,
        to_contact_id: data.to_contact_id,
        relationship_type: data.relationship_type,
        custom_relationship_label: data.custom_relationship_label,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Relationship created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['contact-relationships', contactId] });
      setShowAddForm(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create relationship",
        variant: "destructive",
      });
      console.error('Create relationship error:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (relationshipId: string) => crmApi.contactRelationships.delete(relationshipId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Relationship deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['contact-relationships', contactId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete relationship",
        variant: "destructive",
      });
      console.error('Delete relationship error:', error);
    },
  });

  const onSubmit = (data: CreateContactRelationship) => {
    createMutation.mutate(data);
  };

  const availableContacts = allContacts.filter(contact => contact.id !== contactId);

  const getRelationshipLabel = (type: string, customLabel?: string) => {
    if (type === 'custom' && customLabel) return customLabel;
    return type.replace('-', ' → ').split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' → ');
  };

  const getRelatedContactName = (relationship: any) => {
    const relatedContact = allContacts.find(c => c.id === relationship.to_contact_id);
    return relatedContact ? `${relatedContact.first_name} ${relatedContact.last_name}` : 'Unknown Contact';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relationships for {contactName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Relationships */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Current Relationships</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Relationship
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading relationships...</p>
              ) : relationships.length > 0 ? (
                <div className="space-y-3">
                  {relationships.map((relationship) => (
                    <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getRelationshipLabel(relationship.relationship_type, relationship.custom_relationship_label)}
                          </Badge>
                          <span className="font-medium">{getRelatedContactName(relationship)}</span>
                        </div>
                        {relationship.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{relationship.notes}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(relationship.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No relationships found</p>
              )}
            </CardContent>
          </Card>

          {/* Add Relationship Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add New Relationship</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="to_contact_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Contact</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a contact" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableContacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.first_name} {contact.last_name} ({contact.contact_type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="relationship_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select relationship type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="client-realtor">Client → Realtor</SelectItem>
                              <SelectItem value="client-contractor">Client → Contractor</SelectItem>
                              <SelectItem value="client-vendor">Client → Vendor</SelectItem>
                              <SelectItem value="realtor-contractor">Realtor → Contractor</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('relationship_type') === 'custom' && (
                      <FormField
                        control={form.control}
                        name="custom_relationship_label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Relationship Label</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Business Partner, Referral Source" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Additional notes about this relationship..."
                              rows={2}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Adding..." : "Add Relationship"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
