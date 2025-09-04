import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { servicesApi, Service } from '@/integrations/supabase/servicesApi';
import { REPORT_TYPE_LABELS } from '@/constants/reportTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, DollarSign, Edit3, Check, X, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceForm {
  name: Service['name'];
  price: number;
}

const Services: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: services = [], refetch } = useQuery({
    queryKey: ['services', user?.id],
    queryFn: () => servicesApi.list(user!.id),
    enabled: !!user,
  });

  const createForm = useForm<ServiceForm>();
  const createMutation = useMutation({
    mutationFn: (values: ServiceForm) =>
      servicesApi.create({ ...values, user_id: user!.id }),
    onSuccess: () => {
      refetch();
      createForm.reset();
      toast({
        title: "Service added",
        description: "Your new service has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ServiceForm }) =>
      servicesApi.update(id, values),
    onSuccess: () => {
      refetch();
      toast({
        title: "Service updated",
        description: "Service has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => {
      refetch();
      toast({
        title: "Service deleted",
        description: "Service has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onCreate = createForm.handleSubmit((values) => createMutation.mutate(values));

  const ServiceItem: React.FC<{ service: Service }> = ({ service }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const { register, handleSubmit, setValue, watch } = useForm<ServiceForm>({
      defaultValues: { name: service.name, price: service.price },
    });

    const onSubmit = handleSubmit((values) => {
      updateMutation.mutate({ id: service.id!, values });
      setIsEditing(false);
    });

    return (
      <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
        {isEditing ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-name">Service Type</Label>
                <Select onValueChange={(value) => setValue('name', value as Service['name'])} defaultValue={service.name}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="service-price">Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="service-price"
                    type="number"
                    step="0.01"
                    className="pl-10"
                    {...register('price', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Save
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium">{REPORT_TYPE_LABELS[service.name]}</h3>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">${service.price}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(service.id!)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Add New Service */}
      <div className="border border-dashed border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Service
          </h3>
        </div>
        <form onSubmit={onCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-service-name">Service Type</Label>
              <Select onValueChange={(value) => createForm.setValue('name', value as Service['name'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-service-price">Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-service-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  {...createForm.register('price', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? 'Adding...' : 'Add Service'}
          </Button>
        </form>
      </div>

      {/* Existing Services */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Services</h3>
        {services.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No services yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first service to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <ServiceItem key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
