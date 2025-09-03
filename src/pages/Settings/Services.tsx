import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { servicesApi, Service } from '@/integrations/supabase/servicesApi';

interface ServiceForm {
  name: string;
  price: number;
}

const Services: React.FC = () => {
  const { user } = useAuth();
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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ServiceForm }) =>
      servicesApi.update(id, values),
    onSuccess: () => refetch(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => refetch(),
  });

  const onCreate = createForm.handleSubmit((values) => createMutation.mutate(values));

  const ServiceItem: React.FC<{ service: Service }> = ({ service }) => {
    const { register, handleSubmit } = useForm<ServiceForm>({
      defaultValues: { name: service.name, price: service.price },
    });
    const onSubmit = handleSubmit((values) =>
      updateMutation.mutate({ id: service.id!, values })
    );

    return (
      <form onSubmit={onSubmit} className="flex gap-2 items-center">
        <input
          className="border p-1 flex-1"
          {...register('name')}
          required
        />
        <input
          type="number"
          step="0.01"
          className="border p-1 w-24"
          {...register('price', { valueAsNumber: true })}
          required
        />
        <button
          type="submit"
          className="px-2 py-1 bg-primary text-primary-foreground rounded"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => deleteMutation.mutate(service.id!)}
          className="px-2 py-1 bg-destructive text-destructive-foreground rounded"
        >
          Delete
        </button>
      </form>
    );
  };

  return (
    <div className="space-y-4 max-w-md">
      <form onSubmit={onCreate} className="flex gap-2 items-center">
        <input
          className="border p-1 flex-1"
          placeholder="Service name"
          {...createForm.register('name')}
          required
        />
        <input
          type="number"
          step="0.01"
          className="border p-1 w-24"
          placeholder="Price"
          {...createForm.register('price', { valueAsNumber: true })}
          required
        />
        <button
          type="submit"
          className="px-2 py-1 bg-primary text-primary-foreground rounded"
          disabled={createMutation.isPending}
        >
          Add
        </button>
      </form>
      <div className="space-y-2">
        {services.map((s) => (
          <ServiceItem key={s.id} service={s} />
        ))}
      </div>
    </div>
  );
};

export default Services;
