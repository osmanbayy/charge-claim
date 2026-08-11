import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import {
  PROCESS_RESERVATION_NO_SHOW_JOB,
  RESERVATION_NO_SHOW_QUEUE,
  type ReservationNoShowJobData,
} from '../../../common/queues/reservation-no-show.queue';

@Injectable()
export class ReservationNoShowQueueService {
  constructor(
    @InjectQueue(RESERVATION_NO_SHOW_QUEUE)
    private readonly noShowQueue: Queue<ReservationNoShowJobData>,
  ) {}

  async schedule(reservationId: number, noShowDeadlineAt: Date): Promise<void> {
    const jobId = `reservation-no-show-${reservationId}`;

    const existingJob = await this.noShowQueue.getJob(jobId);
    if (existingJob) {
      const jobState = await existingJob.getState();
      if (jobState === 'failed') {
        await existingJob.retry();
        return;
      }

      if (jobState === 'delayed' && noShowDeadlineAt.getTime() <= Date.now()) {
        await existingJob.changeDelay(0);
      }

      return;
    }

    const delayMilliseconds = Math.max(
      noShowDeadlineAt.getTime() - Date.now(),
      0,
    );

    await this.noShowQueue.add(
      PROCESS_RESERVATION_NO_SHOW_JOB,
      {
        reservationId,
      },
      {
        jobId: `reservation-no-show-${reservationId}`,
        delay: delayMilliseconds,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1_000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
