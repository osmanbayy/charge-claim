"use client";

import { useAuth } from "@/features/auth/providers/auth-provider";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface StaffLayoutProps {
  children: ReactNode,
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "STAFF") router.replace("/stations");
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== "STAFF") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
          <span>Yetki kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>
}