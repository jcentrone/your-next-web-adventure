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
      { organization_id: organization!.id, report_type: null, content_html: '', file: null },
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
    const { convertToHtml } = await import('mammoth/mammoth.browser');
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await convertToHtml({ arrayBuffer });
    const sanitized = DOMPurify.sanitize(value);
    updateRow(index, { file, content_html: sanitized });
  };

  const handleSave = (index: number) => {
    const row = rows[index];
    saveMutation.mutate(row);
  };

  const handleDelete = (index: number) => {
    const row = rows[index];
    if (row.id) {
      deleteMutation.mutate(row.id);
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Terms and Conditions</h2>
      <p className="text-sm text-muted-foreground">
        Manage your organization's terms and conditions.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Template</TableHead>
            <TableHead className="w-[200px]">Upload .docx</TableHead>
            <TableHead>Manual Entry</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id || index}>
              <TableCell>
                <Select
                  value={row.report_type ?? 'all'}
                  onValueChange={(val) =>
                    updateRow(index, {
                      report_type: val === 'all' ? null : (val as TermRow['report_type']),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All templates</SelectItem>
                    {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="file"
                  accept=".docx"
                  onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                />
              </TableCell>
              <TableCell>
                <Textarea
                  value={row.content_html || ''}
                  onChange={(e) => updateRow(index, { content_html: e.target.value })}
                  className="min-h-24"
                />
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSave(index)}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(index)}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        onClick={addRow}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Row
      </Button>
    </div>
  );
};

export default TermsAndConditions;
