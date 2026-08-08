import { PostgresJsTransaction } from 'drizzle-orm/postgres-js';
import * as schema from './drizzle/schema';
import { ExtractTablesWithRelations } from 'drizzle-orm';

export type PostgresTransaction = PostgresJsTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
// Transaction sınırı ConnectorsService içinde açılacak.
// Service’in oluşturduğu transaction, repository metotlarına gönderilecek.
// Repository aynı transaction üzerinden connector satırını kilitleyecek ve kontrolleri yapacak.
