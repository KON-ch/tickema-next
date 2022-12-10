import prisma from '../lib/prisma'

import { appearanceUserData } from '../db/AppearanceUserData'
import { accountData } from '../db/AccountData'
import { appearanceStageData } from '../db/AppearanceStageData'
import { performanceScheduleData } from '../db/PerformanceScheduleData'
import { supporterData } from '../db/SupporterData'
import { saleTicketData } from '../db/SaleTicketData'
import { reservationReceptionData } from '../db/ReservationReception'
import { reservationTicketData } from '../db/ReservationTicket'

async function main() {
  console.log(`Start seeding ...`);

  for (const u of appearanceUserData) {
    const user = await prisma.appearanceUser.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }
  for (const a of accountData) {
    const account = await prisma.account.create({
      data: a,
    });
    console.log(`Created user with id: ${account.id}`);
  }
  for (const s of appearanceStageData) {
    const stage = await prisma.appearanceStage.create({
      data: s,
    });
    console.log(`Created stage with id: ${stage.id}`);
  }
  for (const p of performanceScheduleData) {
    const schedule = await prisma.performanceSchedule.create({
      data: p,
    });
    console.log(`Created schedule with id: ${schedule.id}`);
  }
  for (const s of supporterData) {
    const supporter = await prisma.supporter.create({
      data: s,
    });
    console.log(`Created supporter with id: ${supporter.id}`);
  }
  for (const s of saleTicketData) {
    const ticket = await prisma.saleTicket.create({
      data: s,
    });
    console.log(`Created ticket with id: ${ticket.id}`);
  }

  for (const r of reservationReceptionData) {
    const reception = await prisma.reservationReception.create({
      data: r,
    });
    console.log(`Created reception with id: ${reception.id}`);
  }

  for (const t of reservationTicketData) {
    const ticket = await prisma.reservationTicket.create({
      data: t,
    });
    console.log(`Created ticket with id: ${ticket.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
