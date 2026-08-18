# Charge Claim

Charge Claim, elektrikli araç kullanıcılarının şarj istasyonlarını görüntülemesini, uygun zaman aralıklarını kontrol etmesini, rezervasyon oluşturmasını ve şarj oturumlarını yönetmesini sağlayan full-stack bir uygulamadır.

Frontend ve backend aynı repository içinde pnpm workspace ile yönetilir. Production ortamında Next.js frontend Vercel üzerinde, NestJS API ve BullMQ worker Render üzerinde çalışır. Kalıcı veriler Neon PostgreSQL'de, kuyruk işlemleri ise Redis Cloud'da tutulur.

## Canlı Demo

- Frontend: https://charge-claim-web.vercel.app
- Backend health: https://charge-claim-api.onrender.com/api/health
- API base URL: https://charge-claim-api.onrender.com/api
- Swagger: https://charge-claim-api.onrender.com/api/docs

> Frontend Vercel Hobby, backend Render Free, PostgreSQL Neon Free ve Redis Redis Cloud Free üzerinde çalışır. Render Free servisi kullanılmadığında uykuya geçebildiği için ilk API isteğinin yanıt vermesi yaklaşık 30-60 saniye sürebilir.

## Temel Özellikler

- Kullanıcı kaydı ve JWT tabanlı giriş
- Sürücü ve personel rol yönetimi
- Şarj istasyonu ve connector listeleme
- Tarih ve süreye göre uygunluk kontrolü
- Eş zamanlı isteklere ve çakışmalara karşı güvenli rezervasyon oluşturma
- Rezervasyon iptali ve no-show yönetimi
- Rezervasyondan veya walk-in olarak şarj başlatma
- Aktif şarj oturumu ve geri sayım gösterimi
- Şarj durdurma, enerji ve ücret hesaplama
- BullMQ ile otomatik şarj tamamlama
- Şarj geçmişi
- Personel dashboard'u ve istatistikleri
- Production migration ve güvenli başlangıç verileri
- Healthcheck, HTTPS ve otomatik sertifika yenileme
- Günlük PostgreSQL yedekleme

## Teknolojiler

### Frontend

- Next.js 16
- React 19
- TypeScript
- TanStack Query
- Axios
- Tailwind CSS
- Base UI ve shadcn
- MapLibre GL

### Backend

- NestJS 11
- TypeScript
- PostgreSQL
- Drizzle ORM
- Redis
- BullMQ
- JWT ve Passport
- Swagger

### Altyapı

- pnpm workspace monorepo
- Docker
- Vercel Hobby — Next.js frontend
- Render Free Web Service — NestJS API ve BullMQ worker
- Neon Free — PostgreSQL
- Redis Cloud Free — Redis ve BullMQ
- Otomatik HTTPS
- GitHub tabanlı otomatik deployment

## Production Mimarisi

```text
Kullanıcı
   |
   +-- HTTPS --> Vercel
   |              |
   |              +-- Next.js frontend
   |
   +-- HTTPS --> Render
                  |
                  +-- NestJS API
                  +-- BullMQ worker
                        |
                        +-- Neon PostgreSQL
                        +-- Redis Cloud

Frontend ve backend farklı VM'lerde çalışır. PostgreSQL, Redis, NestJS ve Next.js portları doğrudan internete açılmaz. Dış trafik yalnızca Nginx üzerinden `80` ve `443` portlarından alınır.

## Proje Yapısı

```text
charge-claim/
├── apps/
│   ├── api/                 # NestJS API ve BullMQ worker
│   └── web/                 # Next.js frontend
├── deploy/
│   └── nginx/               # Frontend ve backend Nginx ayarları
├── compose.dev.yml          # Yerel PostgreSQL ve Redis
├── compose.local.yml        # Yerel container entegrasyonu
├── compose.backend.yml      # Backend production VM
├── compose.frontend.yml     # Frontend production VM
└── pnpm-workspace.yaml
```

## Gereksinimler

- Node.js 20 veya üzeri
- pnpm 10
- Docker
- Docker Compose

## Yerel Kurulum

Repository'yi klonlayın ve bağımlılıkları kurun:

```bash
git clone https://github.com/osmanbayy/charge-claim.git
cd charge-claim
pnpm install
```

Ortam dosyalarını oluşturun:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Örnek değerleri yerel ortamınıza göre düzenleyin. Ardından PostgreSQL ve Redis'i başlatın:

```bash
docker compose -f compose.dev.yml up -d
```

Migration ve geliştirme başlangıç verilerini çalıştırın:

```bash
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

API, worker ve frontend'i ayrı terminallerde başlatın:

```bash
pnpm --filter api start:dev
```

```bash
pnpm --filter api start:worker:dev
```

```bash
pnpm --filter web dev
```

Yerel adresler:

- Frontend: http://localhost:3000
- API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs
- Health: http://localhost:3001/api/health

## Ortam Değişkenleri

Production sırları Git'e eklenmez. Repository yalnızca aşağıdaki şablonları içerir:

- `.env.backend.example`
- `.env.frontend.example`
- `apps/api/.env.example`
- `apps/web/.env.example`

Gerçek production dosyaları ilgili sunucularda `.env.backend` ve `.env.frontend` adıyla tutulur. Veritabanı parolası, JWT anahtarı ve SMTP bilgileri repository'ye eklenmemelidir.

## Production Deployment

Production deployment GitHub üzerindeki `main` branch’i üzerinden otomatik olarak gerçekleştirilir.

### Backend — Render

Render, repository kökündeki `apps/api/Dockerfile` dosyasını kullanır.

Temel Render ayarları:

```text
Service type: Web Service
Runtime: Docker
Dockerfile: ./apps/api/Dockerfile
Health check: /api/health

## Kalite Kontrolleri

```bash
pnpm --filter api lint
pnpm --filter api build
pnpm --filter web lint
pnpm --filter web build
```

## Güvenlik Notları

- Production sırları repository içerisinde tutulmaz.
- Vercel ve Render environment değişkenleri platformların secret yönetimi üzerinden saklanır.
- PostgreSQL bağlantısı Neon tarafından sağlanan SSL bağlantısını kullanır.
- Redis bağlantı bilgileri yalnızca Render environment değişkenlerinde tutulur.
- Backend CORS politikası yalnızca production Vercel adresine izin verir.
- JWT anahtarı en az 32 karakter uzunluğundadır.
- Production seed işlemi demo kullanıcılarını otomatik oluşturmaz.
- Migration işlemleri deployment öncesinde test edilmelidir.
- Veritabanı yedekleri repository dışında saklanmalıdır.

## Demo Notu

Bu deployment portföy ve demo amaçlıdır. Render Free servisi kullanılmadığında uykuya geçebilir; bu nedenle uzun süre kullanılmayan uygulamada ilk API isteğinin yanıtlanması yaklaşık 30-60 saniye sürebilir.

Render servisi uyurken BullMQ worker da durur. Servis tekrar başladığında recovery servisleri yarım kalan zamanlanmış işlemleri kontrol eder.

## Lisans

Bu proje eğitim ve portföy amaçlı geliştirilmiştir.
