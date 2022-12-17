import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { locateSchedule } from '../utils/locate';
import { CancelReservationTicket, PerformanceSchedule, ReservationReception, ReservationTicket, Supporter } from '@prisma/client';

import type { Dispatch, SetStateAction } from 'react';

type Schedules = (
  PerformanceSchedule & {
    reservationReceptions: Reception[]
  }
)[]

type Reception = ReservationReception & {
  supporter: Supporter
  reservationTickets: (ReservationTicket & {
    cancelReservationTicket: CancelReservationTicket
  })[]
}


type Props = {
  expanded: number | false
  setExpanded: Dispatch<SetStateAction<number | false>>
  schedules: Schedules
  deleteReception: (reception: Reception) => void
}

const ticketCounter = (sum: number, ticket: ReservationTicket) => {
  return sum + ticket.count;
}

const ScheduleAccordion: React.FC<Props> = ({
  expanded,
  setExpanded,
  schedules,
  deleteReception
}) => {
  const handleChange =
    (panel: number) => (ev: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div>
      {
        schedules.map(schedule => {
          const startedAt = locateSchedule(schedule)

          return (
            <Accordion key={schedule.id} expanded={expanded === schedule.id} onChange={handleChange(schedule.id)}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`schedule-${schedule.id}-header`}
                id={`schedule-${schedule.id}-header`}
              >
                <Typography sx={{ width: '33%', flexShrink: 0 }}>
                  { startedAt }
                </Typography>
                <Typography sx={{ color: 'text.secondary', ml: 2 }}>
                  予約 {
                    schedule.reservationReceptions.flatMap(reception => {
                      return (
                        reception.reservationTickets.filter(ticket =>
                          !ticket.cancelReservationTicket
                        )
                      )
                    }).length
                  } 件
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {
                  schedule.reservationReceptions.map(reception => {
                    const totalCount: number = reception.reservationTickets.reduce(ticketCounter, 0);

                    if (totalCount === 0) { return }

                    return (
                      <Typography key={reception.id}>
                        { reception.supporter.name }
                        <span>{ totalCount }枚</span>
                        <button
                          onClick={ () => deleteReception(reception)}
                        >
                          ✖
                      </button>
                      </Typography>
                    )
                  })
                }
              </AccordionDetails>
            </Accordion>
          )
        })
      }
    </div>
  );
}

export default ScheduleAccordion
