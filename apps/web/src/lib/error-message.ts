import axios from 'axios';

export function getErrorMessage(error: unknown, fallback = 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data as { message?: string | string[] } | undefined;
  const message = data?.message;

  if (Array.isArray(message)) return message[0] ?? fallback;
  if (typeof message === 'string' && message.trim()) return message;
  if (error.code === 'ECONNABORTED') return 'Sunucu yanıt vermedi. Lütfen tekrar deneyin.';
  if (!error.response) return 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';

  return fallback;
}
