'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      richColors
      closeButton
      gap={10}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast: '!rounded-2xl !border-white/10 !bg-[#181824]/95 !text-slate-100 !shadow-[0_24px_70px_-28px_black] !backdrop-blur-xl',
          title: '!font-semibold !tracking-[-.01em]',
          description: '!text-slate-400',
          error: '!border-rose-400/20 [&_[data-icon]]:!text-rose-300',
          success: '!border-emerald-400/20 [&_[data-icon]]:!text-emerald-300',
          warning: '!border-amber-400/20 [&_[data-icon]]:!text-amber-300',
          closeButton: '!border-white/10 !bg-[#20202d] !text-slate-300 hover:!bg-[#292938]',
        },
      }}
    />
  );
}
