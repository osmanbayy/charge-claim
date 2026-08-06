"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

export function PasswordInput({
  className,
  ...props
}: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={isPasswordVisible ? "text" : "password"}
        className={cn("pr-10", className)}
      />

      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
        aria-label={isPasswordVisible ? "Şifreyi gizle" : "Şifreyi göster"}
      >
        {isPasswordVisible ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
}