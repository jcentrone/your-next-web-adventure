import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";
import type { Account } from "@/lib/accountSchemas";

interface AccountsCardViewProps {
  accounts: Account[];
  formatRevenue: (revenue?: number) => string | null;
  onManageTags: (account: Account) => void;
}

export const AccountsCardView: React.FC<AccountsCardViewProps> = ({ 
  accounts, 
  formatRevenue, 
  onManageTags 
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{account.name}</CardTitle>
              <Badge variant="secondary">{account.type}</Badge>
            </div>
            {account.industry && (
              <p className="text-sm text-muted-foreground">{account.industry}</p>
            )}
            {account.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {account.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {account.address && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{account.city}, {account.state}</span>
              </div>
            )}
            
            {account.employee_count && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                <span>{account.employee_count} employees</span>
              </div>
            )}

            {account.annual_revenue && (
              <div className="text-sm">
                <span className="text-muted-foreground">Revenue: </span>
                <span className="font-medium">{formatRevenue(account.annual_revenue)}</span>
              </div>
            )}

            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/accounts/${account.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};