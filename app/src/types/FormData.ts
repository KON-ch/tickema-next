export type CreateStageData = {
  title: string
  performanceSchedules: { startedAt: string }[]
  saleTickets: { type: string, price: number }[]
}
