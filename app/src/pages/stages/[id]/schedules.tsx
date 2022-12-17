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
import ScheduleAccordion from '../../../components/ScheduleAccordion';

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

  const [expandedSchedule, setExpandedSchedule] = useState<number | false>(false);
  useEffect(() => { setExpandedSchedule(false) }, [schedules])

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

    setExpandedSchedule(reservation.performanceScheduleId);
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

  const deleteReception = (
    reception: ReservationReception & {
      supporter: Supporter;
      reservationTickets: ReservationTicket[];
    }
  ) => {
    setDeleteDialog({ open: true, reception: reception})
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
      <ScheduleAccordion
        expanded={expandedSchedule}
        setExpanded={setExpandedSchedule}
        schedules={scheduleReceptions}
        deleteReception={deleteReception}
      />
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
