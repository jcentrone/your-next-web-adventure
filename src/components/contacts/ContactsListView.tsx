import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Mail, Phone, Building, MapPin } from "lucide-react";

interface ContactsListViewProps {
  contacts: any[];
  onEdit: (contact: any) => void;
  onDelete: (contact: any) => void;
  getContactTypeColor: (type: string) => string;
}

export const ContactsListView: React.FC<ContactsListViewProps> = ({ 
  contacts, 
  onEdit, 
  onDelete, 
  getContactTypeColor 
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id} className="group">
              <TableCell>
                <Link 
                  to={`/contacts/${contact.id}`} 
                  className="font-medium hover:text-primary transition-colors"
                >
                  {contact.first_name} {contact.last_name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge className={getContactTypeColor(contact.contact_type)}>
                  {contact.contact_type}
                </Badge>
              </TableCell>
              <TableCell>
                {contact.company && (
                  <div className="flex items-center gap-1 text-sm">
                    <Building className="w-3 h-3" />
                    {contact.company}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {contact.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="hover:text-primary">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span className="hover:text-primary">{contact.phone}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {(contact.city || contact.state) && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {contact.city && contact.state 
                        ? `${contact.city}, ${contact.state}`
                        : contact.city || contact.state
                      }
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(contact);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(contact);
                    }}
                    className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};