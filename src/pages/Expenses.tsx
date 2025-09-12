import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getMyOrganization, type Organization } from "@/integrations/supabase/organizationsApi";
import Seo from "@/components/Seo";
import { ExpenseList } from "@/components/expenses/ExpenseList";

const Expenses: React.FC = () => {
  const { user } = useAuth();

  const { data: organization, isLoading, error } = useQuery<Organization | null>({
    queryKey: ["my-organization"],
    queryFn: getMyOrganization,
    enabled: !!user,
  });

  if (!user || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error("Error loading organization:", error);
  }

  // For expenses, we can use a default organization ID or user ID if no org exists
  const orgId = organization?.id || user.id;

  return (
    <>
      <Seo title="Expenses" />
      <div className="space-y-6">
        <ExpenseList userId={user.id} organizationId={orgId} />
      </div>
    </>
  );
};

export default Expenses;

