import type { NextPage, GetServerSideProps } from 'next';
import Select from 'react-select';

import { ParsedUrlQuery } from 'querystring';

import styles from '../../../styles/Schedules.module.css'

import prisma from '../../../../lib/prisma'
import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react'

import { useForm } from "react-hook-form";

import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import MuiSelect, { SelectChangeEvent } from '@mui/material/Select';

import ReceptionDeleteDialog from '../../../components/ReceptionDeleteDialog';

import DrawerMenu from '../../../components/DrawerMenu';
import { AppearanceStage, CancelReservationTicket, PerformanceSchedule, ReservationReception, ReservationTicket, SaleTicket, Supporter } from '@prisma/client';

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

  const [modal, setModal] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState<{
    open: boolean,
    reception?: ReservationReception & { supporter: Supporter }
  }>({ open: false, reception: undefined })

  const [submitSupporter, setSubmitSupporter] = useState({ label: '', value: null })
  const [validationSupporter, setValidationSupporter] = useState('');

  type SubmitData = {
    performanceScheduleId: string
    receiveType: string
    receptionAt: string
    saleTicketId: string
    count: string
  }

  const { register, handleSubmit, reset } = useForm();

  const formSubmit = async (data: SubmitData) => {
    if (!submitSupporter.value) {
      setValidationSupporter('誰の予約かな?')
      return;
    }

    const endpoint = '/api/reservations';

    const receptionAt = () => {
      const date = new Date(data.receptionAt);
      date.setHours(date.getHours() + 9);
      return date
    }

    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiveType: Number(data.receiveType),
        receptionAt: receptionAt(),
        supporterId: submitSupporter.value,
        performanceScheduleId: Number(data.performanceScheduleId),
        reservationTickets: [
          { saleTicketId: Number(data.saleTicketId),  count: Number(data.count) }
        ],
        appearanceUserId: appearanceUserId
      }),
    };

    try {
      const res = await fetch(endpoint, options);
      const result: ReservationReception = await res.json();

      const addScheduleReceptions = (
        schedule: PerformanceSchedule & { reservationReceptions: ReservationReception[] }
      ) => {
        if (schedule.id == result.performanceScheduleId) {
          return {
            ...schedule,
            reservationReceptions: [
              result,
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

      setOpenList(result.performanceScheduleId);

      reset();
    } catch(e) {
      console.error(e)
    }

    setSubmitSupporter({ label: '', value: null })
    setValidationSupporter('')
    setModal(false);
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
    setOpenDeleteDialog({ open: false, reception: undefined })
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
          onClick={() => setOpenDeleteDialog({ open: true, reception: reception})}
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

  const modalOpen = modal ? styles.open : styles.close

  const scheduleOptionTag = (schedule: PerformanceSchedule) => {
    return (
      <option
        value={schedule.id}
        key={schedule.id}
      >
        {locateSchedule(schedule)}
      </option>
    )
  }

  const ticketOptionTag = (ticket: SaleTicket) => {
    return (
      <option
        value={ticket.id}
        key={ticket.id}
      >
        { ticket.type }
      </option>
    )
  }

  const supporterOption = (supporter: Supporter) => {
    return { value: supporter.id, label: supporter.name }
  }

  const current = new Date()
  const year = current.getFullYear();
  const month = (current.getMonth() + 1) < 10 ? `0${current.getMonth()}` : current.getMonth() + 1;
  const date = current.getDate() < 10 ? `0${current.getDate()}` : current.getDate();

  const receptionAtDefaultValue = `${year}-${month}-${date}`

  return (
    <div className={styles.schedules}>
      <DrawerMenu currentStageId={stage.id} />
      <ReceptionDeleteDialog
        dialog={openDeleteDialog}
        setDialog={setOpenDeleteDialog}
        deleteTicket={deleteTicket}
      />
      <div className={`modal ${modalOpen}`}>
        <div className="modal-field">
          <h2 className={styles.subtitle}>チケットを予約する</h2>
          <form onSubmit={handleSubmit(formSubmit)}>
            <div>{validationSupporter}</div>
            {/* instanceId 必須 */}
            <Select
              instanceId="supporter"
              defaultValue={submitSupporter}
              value={submitSupporter}
              unstyled
              onChange={setSubmitSupporter}
              options={supporters.map(supporterOption)}
            />
            <div>
              <label>公演日:</label>
              <select { ...register('performanceScheduleId') }>
                { schedules.map(scheduleOptionTag) }
              </select>
            </div>
            <div>
              <label>発券方法:</label>
              <select { ...register('receiveType')}>
                <option value={1}>劇場</option>
                <option value={2}>郵送</option>
              </select>
            </div>
            <div>
              <label>予約受付日:
                <input
                  type='date'
                  defaultValue={receptionAtDefaultValue}
                  required
                  { ...register('receptionAt')}
                />
              </label>
            </div>
            <div>
              <select { ...register('saleTicketId') }>
                { saleTickets.map(ticketOptionTag) }
              </select>
              <FormControl variant="standard" required sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-label">予約枚数</InputLabel>
                <MuiSelect
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="予約枚数"
                  {...register('count') }
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                </MuiSelect>
              </FormControl>
            </div>
            <div>
              <button
                type='button'
                onClick={() => { setModal(false) }}
              >キャンセル</button>
              <button type='submit'>登録</button>
            </div>
          </form>
        </div>
      </div>
      {scheduleReceptions.map(renderSchedule)}
      <Fab
        sx={{
          position: 'fixed',
          top: '80%',
          left: '70%'
        }}
        color="secondary"
        aria-label="add"
        onClick={() => setModal(true) }
      >
        <AddIcon />
      </Fab>
    </div>
  );
};

export default Page
