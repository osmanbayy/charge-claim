"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push("/stations");
      router.refresh();
    } catch {
      toast.error('Giriş yapılamadı', { description: 'E-posta adresi veya şifre hatalı.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute left-1/2 top-1/3 -z-10 size-96 -translate-x-1/2 rounded-full bg-emerald-400/8 blur-3xl" />
      <Card className="w-full max-w-md rounded-3xl border-white/10 bg-card/90 shadow-[0_30px_100px_-45px_black]">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-300">
            <LogIn className="size-6" />
          </div>

          <div>
            <CardTitle className="text-2xl">Hesabınıza giriş yapın</CardTitle>
            <CardDescription className="mt-2">
              Şarj istasyonlarını ve hesabınızı yönetmek için giriş yapın.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">E mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Şifrenizi girin"
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Giriş yapılıyor..." : "Giriş yap"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Henüz hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-300 hover:text-emerald-200 hover:underline"
            >
              Kayıt olun
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
