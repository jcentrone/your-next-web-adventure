import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getMyOrganization, type Organization } from "@/integrations/supabase/organizationsApi";
import Seo from "@/components/Seo";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { ExpenseList } from "@/components/expenses/ExpenseList";

const Expenses: React.FC = () => {
  const { user } = useAuth();

  const { data: organization, isLoading } = useQuery<Organization | null>({
    queryKey: ["my-organization"],
    queryFn: getMyOrganization,
    enabled: !!user,
  });

  if (!user || isLoading) {
    return <div>Loading...</div>;
  }

  if (!organization) {
    return <div>No organization found.</div>;
  }

  return (
    <>
      <Seo title="Expenses" />
      <div className="space-y-6">
        <ExpenseForm userId={user.id} organizationId={organization.id} />
        <ExpenseList userId={user.id} organizationId={organization.id} />
      </div>
    </>
  );
};

export default Expenses;

