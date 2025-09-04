import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { termsApi, Term } from '@/integrations/supabase/termsApi';
import { REPORT_TYPE_LABELS } from '@/constants/reportTypes';
import { useToast } from '@/hooks/use-toast';
import { getMyOrganization } from '@/integrations/supabase/organizationsApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';

interface TermRow extends Term {
  file?: File | null;
}

const TermsAndConditions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: organization } = useQuery({
    queryKey: ['my-organization'],
    queryFn: getMyOrganization,
    enabled: !!user,
  });

  const { data: terms, refetch } = useQuery({
    queryKey: ['terms-and-conditions', organization?.id],
    queryFn: () => termsApi.list(organization!.id),
    enabled: !!organization?.id,
  });

  const [rows, setRows] = React.useState<TermRow[]>([]);

  React.useEffect(() => {
    if (terms) setRows(terms);
  }, [terms]);

  const updateRow = (index: number, updates: Partial<TermRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...updates } : row)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { organization_id: organization!.id, report_type: 'all', content_html: '', file: null },
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: (row: TermRow) => termsApi.save({ ...row, organization_id: organization!.id }),
    onSuccess: () => {
      toast({ title: 'Saved', description: 'Terms saved successfully.' });
      refetch();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save terms.', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => termsApi.remove(id),
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Terms deleted successfully.' });
      refetch();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete terms.', variant: 'destructive' });
    },
  });

  const handleFileChange = async (index: number, file: File | null) => {
    if (!file) {
      updateRow(index, { file: null });
      return;
    }