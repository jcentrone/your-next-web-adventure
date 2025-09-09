import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit, Trash2, Mail, Phone, Building, MapPin, Tag } from "lucide-react";
import { ActionsMenu, ActionItem } from "@/components/ui/actions-menu";
import type { Contact } from "@/lib/crmSchemas";

interface ContactsCardViewProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onManageTags: (contact: Contact) => void;
  getContactTypeColor: (type: string) => string;
}

export const ContactsCardView: React.FC<ContactsCardViewProps> = ({
  contacts,
  onEdit,
  onDelete,
  onManageTags,
  getContactTypeColor
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer group">
          <Link to={`/contacts/${contact.id}`} className="block">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {contact.first_name} {contact.last_name}
                  </CardTitle>
                  {contact.company && (
                    <CardDescription className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {contact.company}
                    </CardDescription>
                  )}
                  {contact.account && (
                    <CardDescription className="flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-blue-500" />
                        <Link
                          to={`/accounts/${contact.account.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.account.name}
                        </Link>
                        <Badge variant="outline" className="ml-1 text-xs">
                          {contact.account.type}
                        </Badge>
                      </div>
                    </CardDescription>
                  )}
                  {contact.tags?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {contact.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
                  <span className="hover:text-primary">
                    {contact.email}
                  </span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span className="hover:text-primary">
                    {contact.phone}
                  </span>
                </div>
              )}
              {(contact.address || contact.city || contact.state) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {contact.address || `${contact.city || ''}${contact.city && contact.state ? ', ' : ''}${contact.state || ''}`}
                  </span>
                </div>
              )}
              {contact.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {contact.notes}
                </p>
              )}
            </CardContent>
          </Link>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionsMenu 
              actions={[
                {
                  key: "tags",
                  label: "Manage Tags",
                  icon: <Tag className="h-4 w-4" />,
                  onClick: () => {
                    onManageTags(contact);
                  },
                },
                {
                  key: "edit",
                  label: "Edit Contact",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => {
                    onEdit(contact);
                  },
                },
                {
                  key: "delete",
                  label: "Delete Contact",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => {
                    onDelete(contact);
                  },
                  variant: "destructive" as const,
                },
              ] as ActionItem[]}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};