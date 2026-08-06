"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerRequest } from "@/features/auth/api/auth";
import { PasswordInput } from "@/components/ui/password-input";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);

    if (password !== passwordConfirmation) {
      setErrorMessage('Şifreler eşleşmiyot.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerRequest({
        name,
        email,
        password,
      });
      router.push("/login");
    } catch {
      setErrorMessage("Kayıt oluşturualamadı. E posta adresi daha önce alınmış olabilir.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <UserPlus className="size-6" />
          </div>

          <div>
            <CardTitle className="text-2xl">Yeni hesap oluşturun</CardTitle>
            <CardDescription className="mt-2">
              Şarj istasyonlarını kullanmaya başlamak için kayıt olun.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Ad soyad</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Osman Bay"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta adresi</Label>
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
              <PasswordInput
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Şifrenizi oluşturun"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <p className="text-xs text-muted-foreground">
                En az 8 karakter; büyük harf, küçük harf, rakam ve özel karakter
                kullanın.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Şifre tekrarı</Label>
              <PasswordInput
                id="passwordConfirmation"
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
                placeholder="Şifrenizi tekrar girin"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Hesap oluşturuluyor..." : "Kayıt ol"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-700 hover:underline"
            >
              Giriş yapın
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}