import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, DollarSign, ExternalLink, Tag } from "lucide-react";
import type { Account } from "@/lib/accountSchemas";

interface AccountsListViewProps {
  accounts: Account[];
  formatRevenue: (revenue?: number) => string | null;
  onManageTags: (account: Account) => void;
}

export const AccountsListView: React.FC<AccountsListViewProps> = ({ accounts, formatRevenue, onManageTags }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{account.name}</div>
                  {account.email && (
                    <div className="text-sm text-muted-foreground">{account.email}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{account.type}</Badge>
              </TableCell>
              <TableCell>
                {account.industry && (
                  <Badge variant="outline">{account.industry}</Badge>
                )}
              </TableCell>
              <TableCell>
                {account.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="mr-1">
                    {tag}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                {(account.city || account.state) && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{account.city}, {account.state}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {account.employee_count && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{account.employee_count}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {account.annual_revenue && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>{formatRevenue(account.annual_revenue)}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onManageTags(account)}
                >
                  <Tag className="h-4 w-4" />
                  <span className="sr-only">Manage tags</span>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/accounts/${account.id}`}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
