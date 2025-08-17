import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit, Trash2, Mail, Phone, Building, MapPin } from "lucide-react";

interface ContactsCardViewProps {
  contacts: any[];
  onEdit: (contact: any) => void;
  onDelete: (contact: any) => void;
  getContactTypeColor: (type: string) => string;
}

export const ContactsCardView: React.FC<ContactsCardViewProps> = ({ 
  contacts, 
  onEdit, 
  onDelete, 
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
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(contact);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(contact);
              }}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};