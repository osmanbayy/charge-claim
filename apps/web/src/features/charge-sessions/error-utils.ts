import axios from 'axios';

interface ApiErrorResponse {
  code?: string;
  message?: string | string[];
}

const chargingErrorMessages: Record<string, string> = {
  RESERVATION_CANNOT_BE_STARTED:
    'Bu rezervasyon şarj başlatmak için uygun durumda değil.',

  RESERVATION_START_WINDOW_CLOSED:
    'Şarj yalnızca rezervasyon başlangıcı ile katılım süresi dolana kadar başlatılabilir.',

  CONNECTOR_IN_MAINTENANCE:
    'Seçilen connector şu anda bakımda.',

  CONNECTOR_ALREADY_OCCUPIED:
    'Seçilen connector başka bir şarj oturumu tarafından kullanılıyor.',

  CONNECTOR_RESERVED_FOR_SELECTED_RANGE:
    'Seçilen süre yaklaşan bir rezervasyonla çakışıyor.',

  CHARGING_SESSION_ALREADY_ACTIVE:
    'Zaten devam eden aktif bir şarj oturumunuz var.',

  CHARGING_SESSION_NOT_ACTIVE:
    'Bu şarj oturumu artık aktif değil.',

  RESERVATION_CANNOT_BE_COMPLETED:
    'Şarj oturumu tamamlanırken bağlı rezervasyon güncellenemedi.',
};

export function getChargingErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage;
  }

  const errorCode = error.response?.data.code;

  if (
    errorCode &&
    errorCode in chargingErrorMessages
  ) {
    return chargingErrorMessages[errorCode];
  }

  const responseMessage = error.response?.data.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(' ');
  }

  if (typeof responseMessage === 'string') {
    return responseMessage;
  }

  if (error.response?.status === 401) {
    return 'Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.';
  }

  if (error.response?.status === 403) {
    return 'Bu işlem için sürücü yetkisi gerekiyor.';
  }

  if (error.response?.status === 404) {
    return 'İstenen şarj oturumu veya connector bulunamadı.';
  }

  return fallbackMessage;
}