'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  disabled = false,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  function goToPreviousPage(): void {
    if (!hasPreviousPage || disabled) {
      return;
    }

    onPageChange(currentPage - 1);
  }

  function goToNextPage(): void {
    if (!hasNextPage || disabled) {
      return;
    }

    onPageChange(currentPage + 1);
  }

  return (
    <nav
      aria-label="Sayfalama"
      className="mt-8 flex items-center justify-between gap-4 rounded-2xl border bg-card p-4"
    >
      <Button
        type="button"
        variant="outline"
        disabled={disabled || !hasPreviousPage}
        onClick={goToPreviousPage}
      >
        <ChevronLeft className="size-4" />
        Önceki
      </Button>

      <p
        className="text-sm text-muted-foreground"
        aria-live="polite"
      >
        Sayfa {currentPage} / {totalPages}
      </p>

      <Button
        type="button"
        variant="outline"
        disabled={disabled || !hasNextPage}
        onClick={goToNextPage}
      >
        Sonraki
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}