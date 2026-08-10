import axios from "axios";

interface ApiErrorResponse {
  message?: string | string[];
}

export function getCancellationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error))
    return 'Rezervasyon iptal edilemedi. Tekrar deneyin.';

  const responseMessage = error.response?.data.message;

  const message = Array.isArray(responseMessage)
    ? responseMessage.join(' ')
    : responseMessage;

  if (error.response?.status === 409) {
    return (
      message ??
      'Bu rezervasyon artık iptal edilebilir durumda değil.'
    );
  }

  if (error.response?.status === 404) {
    return 'Rezervasyon bulunamadı.';
  }

  return message ?? 'Rezervasyon iptal edilemedi.';
}