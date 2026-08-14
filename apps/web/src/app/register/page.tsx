"use client";

import { useState, type SubmitEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { toast } from 'sonner';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      toast.error('Şifreler eşleşmiyor', { description: 'Her iki alana da aynı şifreyi girin.' });
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
      toast.error('Kayıt oluşturulamadı', { description: 'E-posta adresi daha önce alınmış olabilir.' });
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
              className="w-full cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Hesap oluşturuluyor..." : "Kayıt ol"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-300 hover:text-emerald-200 hover:underline"
            >
              Giriş yapın
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
