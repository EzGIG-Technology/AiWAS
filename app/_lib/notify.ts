import { toast } from '@/components/ui/toast';

export const notify = {
  success: (title: string, description?: string) =>
    toast.add({ title, description, type: 'success' }),
  info: (title: string, description?: string) =>
    toast.add({ title, description, type: 'info' }),
  warning: (title: string, description?: string) =>
    toast.add({ title, description, type: 'warning' }),
  error: (title: string, description?: string) =>
    toast.add({ title, description, type: 'error' }),
};
