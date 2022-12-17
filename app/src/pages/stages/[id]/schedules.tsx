import type { NextPage, GetServerSideProps } from 'next';

import { ParsedUrlQuery } from 'querystring';

import styles from '../../../styles/Schedules.module.css'

import prisma from '../../../../lib/prisma'
import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react'

import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'

import ReceptionDeleteDialog from '../../../components/ReceptionDeleteDialog';
import ReceptionCreateDialog from '../../../components/ReceptionCreateDialog';
import DrawerMenu from '../../../components/DrawerMenu';

import { AppearanceStage, CancelReservationTicket, PerformanceSchedule, ReservationReception, ReservationTicket, SaleTicket, Supporter } from '@prisma/client';
import { AppBar, Toolbar, Typography } from '@mui/material';

interface Params extends ParsedUrlQuery {
  id: string
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ctx => {
  const { id } = ctx.params as Params;
  const session = await getSession(ctx);

  if (!session) {
    return { props: {} };
  }

  const stage = await prisma.appearanceStage.findUnique({
    where: {
      id: Number(id),
    }
  })

  const appearanceUser = await prisma.appearanceUser.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true
    }
  })

  if (!stage || !appearanceUser || stage.appearanceUserId !== appearanceUser.id) {
    return {
      redirect: {
        permanent: true,
        destination: '/'
      }
    }
  }

  const scheduleData = await prisma.performanceSchedule.findMany({
    where: {
      appearanceStageId: stage.id
    },
    select: {
      id: true,
      startedAt: true,
      reservationReceptions: {
        select: {
          id: true,
          receiveType: true,
          receptionAt: true,
          supporter: {
            select: {
              name: true,
            }
          },
          reservationTickets: {
            where: {
              cancelReservationTicket: null // キャンセルされていないものだけ
            },
            select: {
              id: true,
              count: true
            }
          }
        },
        orderBy: { receptionAt: 'desc' }
      }
    },
    orderBy: { startedAt: 'asc' }
  });

  const supportersData = await prisma.supporter.findMany({
    where: {
      appearanceUserId: appearanceUser.id
    },
    select: {
      id: true,
      name: true
    },
    orderBy: { name: 'asc' }
  });

  const saleTicketData = await prisma.saleTicket.findMany({
    where: {
      appearanceStageId: stage.id
    },
    select: {
      id: true,
      type: true
    },
    orderBy: { id: 'asc' }
  })

  const schedules: PerformanceSchedule[] = JSON.parse(JSON.stringify(scheduleData));
  const supporters: Supporter[] = JSON.parse(JSON.stringify(supportersData));
  const saleTickets: SaleTicket[] = JSON.parse(JSON.stringify(saleTicketData));

  return { props: { stage, schedules, supporters, saleTickets, appearanceUserId: appearanceUser.id } };
};

type PageProps = {
  stage: AppearanceStage
  schedules: PerformanceSchedule[]
  supporters: Supporter[]
  saleTickets: SaleTicket[]
  appearanceUserId: string
};

const Page: NextPage<PageProps> = ({
  stage,
  schedules,
  supporters,
  saleTickets,
  appearanceUserId
}) => {
  const [scheduleReceptions, setScheduleReceptions] = useState(schedules);
  useEffect(() => { setScheduleReceptions(schedules) }, [schedules])

  const [openList, setOpenList] = useState(-1);
  useEffect(() => { setOpenList(-1) }, [schedules])

  const [createDialog, setCreateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean,
    reception?: ReservationReception & { supporter: Supporter, reservationTickets: ReservationTicket[] }
  }>({ open: false, reception: undefined })

  const formSubmit = (reservation: ReservationReception) => {
    const addScheduleReceptions = (
      schedule: PerformanceSchedule & { reservationReceptions: ReservationReception[] }
    ) => {
      if (schedule.id == reservation.performanceScheduleId) {
        return {
          ...schedule,
          reservationReceptions: [
            reservation,
            ...schedule.reservationReceptions
          ]
        }
      } else {
        return schedule
      }
    };

    setScheduleReceptions(
      scheduleReceptions.map(addScheduleReceptions)
    );

    setOpenList(reservation.performanceScheduleId);
  };

  const deleteTicket = async (cancelTicket: CancelReservationTicket) => {
    const verifiedTickets = (reception: ReservationReception & { reservationTickets: ReservationTicket[] }) => {
      return {
        ...reception,
        reservationTickets: reception.reservationTickets.filter(ticket =>
          ticket.id !== cancelTicket.reservationTicketId
        )
      };
    };

    const verifiedSchedule = (schedule: PerformanceSchedule & { reservationReceptions: ReservationReception[] }) => {
      return {
        ...schedule,
        reservationReceptions: schedule.reservationReceptions.map(verifiedTickets)
      };
    };

    setScheduleReceptions(scheduleReceptions.map(verifiedSchedule));
    setDeleteDialog({ open: false, reception: undefined })
  }

  function renderReception(
    reception: ReservationReception & { reservationTickets: ReservationTicket[], supporter: Supporter }
  ): JSX.Element | undefined {
    const ticketCounter = (sum: number, ticket: ReservationTicket) => {
      return sum + ticket.count;
    }

    const totalCount: number = reception.reservationTickets.reduce(ticketCounter, 0);

    if (totalCount === 0) { return }

    return (
      <div className={styles.info} key={reception.id}>
        {reception.supporter.name}
        <span>{totalCount}枚</span>
        <button
          onClick={() => setDeleteDialog({ open: true, reception: reception})}
        >
          ✖
        </button>
      </div>
    );
  }

  const locateSchedule = (schedule: PerformanceSchedule) => {
    const date: Date = new Date(schedule.startedAt);
    const month: String = (date.getUTCMonth() + 1).toString();
    const dt: String = date.getUTCDate().toString();
    const hour: String = date.getUTCHours().toString();
    const minutes: String = date.getUTCMinutes() > 9 ? date.getUTCMinutes().toString() : '0' + date.getUTCMinutes();

    return `${month}月${dt}日 ${hour}:${minutes}`;
  }

  function renderSchedule(schedule: PerformanceSchedule & { reservationReceptions: ReservationReception[] }): JSX.Element {
    const startedAt = locateSchedule(schedule)

    const scheduleId: number = schedule.id
    const displayStyle = scheduleId == openList ? styles.open : styles.close

    const toggleList = (scheduleId: number) => {
      if (scheduleId == openList) {
        setOpenList(-1)
        return;
      }
      setOpenList(scheduleId)
    }

    return (
      <div className={styles.list} key={schedule.id}>
        <div className={styles.date} onClick={() => toggleList(scheduleId)}>{startedAt}
          <button>▽</button>
        </div>
        <div className={displayStyle}>
          {schedule.reservationReceptions.map(renderReception)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.schedules}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {stage.title}
          </Typography>
          <DrawerMenu currentStageId={stage.id} />
        </Toolbar>
      </AppBar>
      <ReceptionDeleteDialog
        dialog={deleteDialog}
        setDialog={setDeleteDialog}
        deleteTicket={deleteTicket}
      />
      {scheduleReceptions.map(renderSchedule)}
      <Fab
        sx={{
          position: 'fixed',
          top: '80%',
          left: '70%'
        }}
        color="secondary"
        aria-label="add"
        onClick={() => setCreateDialog(true) }
      >
        <AddIcon />
      </Fab>
      <ReceptionCreateDialog
        dialog={createDialog}
        setDialog={setCreateDialog}
        saleTickets={saleTickets}
        scheduleReceptions={scheduleReceptions}
        supporters={supporters}
        appearanceUserId={appearanceUserId}
        formSubmit={formSubmit}
      />
    </div>
  );
};

export default Page
