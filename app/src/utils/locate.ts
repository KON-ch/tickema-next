import type { PerformanceSchedule } from '@prisma/client'

export const locateSchedule = (schedule: PerformanceSchedule) => {
  const date: Date = new Date(schedule.startedAt);
  const month: String = (date.getUTCMonth() + 1).toString();
  const dt: String = date.getUTCDate().toString();
  const hour: String = date.getUTCHours().toString();
  const minutes: String = date.getUTCMinutes() > 9 ? date.getUTCMinutes().toString() : '0' + date.getUTCMinutes();

  return `${month}月${dt}日 ${hour}:${minutes}`;
}
