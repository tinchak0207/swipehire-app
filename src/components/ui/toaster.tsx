'use client';

import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  const toastsWithOnClose = toasts.map((toast) => ({
    ...toast,
    title: toast.title || 'Notification',
    onClose: () => dismiss(toast.id),
  }));

  return <ToastContainer toasts={toastsWithOnClose} onRemoveToast={dismiss} />;
}
