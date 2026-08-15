# Charge Claim

Charge Claim, elektrikli araç kullanıcılarının şarj istasyonlarını görüntülemesini, uygun zaman aralıklarını kontrol etmesini, rezervasyon oluşturmasını ve şarj oturumlarını yönetmesini sağlayan full-stack bir uygulamadır.

Frontend ve backend aynı repository içinde pnpm workspace ile yönetilir. Production ortamında ise frontend ve backend birbirinden bağımsız iki Google Cloud VM üzerinde çalışır.

## Canlı Demo

- Frontend: https://chargeclaim.duckdns.org
- Backend health: https://chargeclaim-api.duckdns.org/api/health
- API base URL: https://chargeclaim-api.duckdns.org/api

> Bu proje portföy ve demo amaçlıdır. Google Cloud deneme kaynakları durdurulduğunda canlı bağlantılar geçici olarak erişilemez olabilir.

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
- Docker ve Docker Compose
- Nginx reverse proxy
- Let's Encrypt
- Google Cloud Compute Engine
- systemd

## Production Mimarisi

```text
İnternet
   |
   +-- HTTPS --> Frontend VM
   |              |
   |              +-- Nginx :443
   |                    |
   |                    +-- Next.js :3000
   |
   +-- HTTPS --> Backend VM
                  |
                  +-- Nginx :443
                        |
                        +-- NestJS API :3001
                              |
                              +-- PostgreSQL
                              +-- Redis
                              +-- BullMQ Worker
```

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

### Backend VM

Backend VM; PostgreSQL, Redis, migration, NestJS API, BullMQ worker ve Nginx servislerini çalıştırır.

İlk kurulum veya güncelleme:

```bash
cd /opt/charge-claim
git pull origin main

docker compose \
  --env-file .env.backend \
  -f compose.backend.yml \
  up -d --build
```

Servis durumlarını kontrol etmek için:

```bash
docker compose \
  --env-file .env.backend \
  -f compose.backend.yml \
  ps -a
```

Production başlangıç verilerini manuel eklemek için:

```bash
docker compose \
  --env-file .env.backend \
  -f compose.backend.yml \
  --profile tools \
  run --rm seed
```

Production seed işlemi kullanıcı oluşturmaz; yalnızca istasyon ve connector verilerini idempotent biçimde ekler.

### Frontend VM

Frontend VM, Next.js ve Nginx servislerini çalıştırır.

İlk kurulum veya güncelleme:

```bash
cd /opt/charge-claim
git pull origin main

docker compose \
  --env-file .env.frontend \
  -f compose.frontend.yml \
  up -d --build
```

`NEXT_PUBLIC_API_URL` build sırasında frontend paketine yazılır. API adresi değiştirildiğinde frontend imajı yeniden oluşturulmalıdır.

## Bakım ve Kontrol

Backend logları:

```bash
docker compose \
  --env-file .env.backend \
  -f compose.backend.yml \
  logs api worker nginx --tail 100
```

Frontend logları:

```bash
docker compose \
  --env-file .env.frontend \
  -f compose.frontend.yml \
  logs web nginx --tail 100
```

Sertifikalar Certbot systemd timer ile otomatik yenilenir:

```bash
systemctl status certbot.timer
sudo certbot renew --dry-run
```

Backend PostgreSQL yedekleri her gece systemd timer tarafından oluşturulur:

```bash
systemctl list-timers charge-claim-backup.timer --no-pager
ls -lh /opt/charge-claim-backups/postgres
```

> Günlük yedek alma doğrulanmıştır. Yedekten geri yükleme prosedürü bu demo kapsamında test edilmemiştir.

## Kalite Kontrolleri

```bash
pnpm --filter api lint
pnpm --filter api build
pnpm --filter web lint
pnpm --filter web build
```

## Güvenlik Notları

- PostgreSQL, Redis, API ve Next.js portları doğrudan internete açılmaz.
- Dış trafik Nginx üzerinden HTTPS ile alınır.
- Production sırları Git tarafından izlenmez.
- Demo kullanıcıları production seed işlemine dahil edilmez.
- Migration API başlamadan önce tamamlanır.
- Veritabanı ve Redis kalıcı Docker volume'larında tutulur.
- Uygulama portları ve servis parolaları public repository içinde paylaşılmaz.

## Demo Notu

Bu deployment portföy gösterimi amacıyla Google Cloud deneme kaynakları üzerinde çalışır. VM'ler durdurulduğunda veya deneme süresi sona erdiğinde canlı bağlantılar geçici olarak erişilemez olabilir.

## Lisans

Bu proje eğitim ve portföy amaçlı geliştirilmiştir.
