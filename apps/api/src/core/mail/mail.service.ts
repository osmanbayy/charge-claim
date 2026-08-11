import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from '../config/app-config.service';
import { istanbulDateTimeFormatter } from '../../utils/date-time-formatter';

export interface SendNoShowEmailInput {
  recipientName: string;
  recipientEmail: string;
  reservationId: number;
  reservationStartAt: Date;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: AppConfigService) {
    const mailConfig = this.config.mail;

    const auth =
      mailConfig.user && mailConfig.password
        ? {
            user: mailConfig.user,
            pass: mailConfig.password,
          }
        : undefined;

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth,
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.config.nodeEnv !== 'development') return;

    try {
      await this.verifyConnection();
      this.logger.log('SMTP connection verified successfully.');
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('SMTP connection verification failed.', errorStack);
    }
  }

  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
  }

  async sendNoShowEmail(input: SendNoShowEmailInput): Promise<void> {
    const formattedStartAt = istanbulDateTimeFormatter.format(
      input.reservationStartAt,
    );

    await this.transporter.sendMail({
      from: this.config.mail.from,
      to: input.recipientEmail,
      subject: 'Şarj rezervasyonunuza katılım sağlamadınız.',
      text: [
        `Merhaba ${input.recipientName}`,
        '',
        `#${input.reservationId} numaralı rezervasyonunuz için belirtilen süre içinde şarj başlatılmadı.`,
        `Rezervasyon başlangıcı: ${formattedStartAt}`,
        '',
        'Rezervasyonunuz katılım sağlanmadığı için NO_SHOW durumuna geçirildi.',
        'İlgili konnektör diğer kullanıcılar için yeniden müsait hâle getirildi.',
        '',
        'Charge Claim',
      ].join('\n'),
    });
  }
}
