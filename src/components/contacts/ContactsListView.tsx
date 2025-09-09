import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Mail, Phone, Building, MapPin, ChevronUp, ChevronDown, Tag } from "lucide-react";
import { ActionsMenu, ActionItem } from "@/components/ui/actions-menu";
import type { Contact } from "@/lib/crmSchemas";

interface ContactsListViewProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onManageTags: (contact: Contact) => void;
  getContactTypeColor: (type: string) => string;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

export const ContactsListView: React.FC<ContactsListViewProps> = ({
  contacts,
  onEdit,
  onDelete,
  onManageTags,
  getContactTypeColor,
  sortField,
  sortDirection,
  onSort
}) => {
  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        )}
      </div>
    </TableHead>
  );
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="name">Name</SortableHeader>
            <SortableHeader field="contact_type">Type</SortableHeader>
            <SortableHeader field="company">Company/Account</SortableHeader>
            <TableHead>Contact Info</TableHead>
            <SortableHeader field="location">Location</SortableHeader>
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
                {contact.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contact.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
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
                {contact.account && (
                  <div className="flex items-center gap-1 text-sm">
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
                <ActionsMenu 
                  actions={[
                    {
                      key: "tags",
                      label: "Manage Tags",
                      icon: <Tag className="h-4 w-4" />,
                      onClick: () => onManageTags(contact),
                    },
                    {
                      key: "edit",
                      label: "Edit Contact",
                      icon: <Edit className="h-4 w-4" />,
                      onClick: () => onEdit(contact),
                    },
                    {
                      key: "delete",
                      label: "Delete Contact",
                      icon: <Trash2 className="h-4 w-4" />,
                      onClick: () => onDelete(contact),
                      variant: "destructive" as const,
                    },
                  ] as ActionItem[]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};