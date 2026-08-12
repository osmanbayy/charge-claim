import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bullmq';
import {
  CHARGING_SESSION_COMPLETION_QUEUE,
  COMPLETE_CHARGING_SESSION_JOB,
  type ChargingSessionCompletionJobData,
} from '../../common/queues/charging-session-completion.queue';

@Injectable()
export class ChargingSessionCompletionQueueService {
  constructor(
    @InjectQueue(CHARGING_SESSION_COMPLETION_QUEUE)
    private readonly completionQueue: Queue<ChargingSessionCompletionJobData>,
  ) {}

  async schedule(sessionId: number, plannedEndAt: Date): Promise<void> {
    const jobId = `charging-session-completion-${sessionId}`;

    const existingJob = await this.completionQueue.getJob(jobId);
    if (existingJob) {
      const jobState = await existingJob.getState();
      if (jobState === 'failed') {
        await existingJob.retry();
        return;
      }

      if (jobState === 'delayed' && plannedEndAt.getTime() <= Date.now())
        await existingJob.changeDelay(0);

      return;
    }

    const delayMs = Math.max(plannedEndAt.getTime() - Date.now(), 0);

    await this.completionQueue.add(
      COMPLETE_CHARGING_SESSION_JOB,
      { sessionId },
      {
        jobId,
        delay: delayMs,
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
