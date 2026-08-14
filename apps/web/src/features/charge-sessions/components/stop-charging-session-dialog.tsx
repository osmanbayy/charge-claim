'use client';

import { Square } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/confirm-action-dialog';

interface StopChargingSessionDialogProps {
  open: boolean;
  isStopping: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function StopChargingSessionDialog({
  open,
  isStopping,
  onOpenChange,
  onConfirm,
}: StopChargingSessionDialogProps) {
  return (
    <ConfirmActionDialog
      open={open}
      title="Şarj oturumunu durdur"
      description="Şarj oturumu mevcut zamana göre tamamlanacak. Tüketilen enerji ve ücret geçen süre üzerinden hesaplanacaktır."
      confirmLabel="Şarjı durdur"
      pendingLabel="Şarj durduruluyor..."
      confirmIcon={<Square className="size-4" />}
      isPending={isStopping}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
