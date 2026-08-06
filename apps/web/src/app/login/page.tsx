"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push("/stations");
      router.refresh();
    } catch {
      setErrorMessage('E mail veya şifre hatalı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
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
            {errorMessage && (
              <Alert variant={"destructive"}>
                <AlertCircle />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

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
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Giriş yapılıyor..." : "Giriş yap"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Henüz hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-700 hover:underline"
            >
              Kayıt olun
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}