import {
  Accordion, AccordionDetails, AccordionSummary, Typography, IconButton, Grid
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelIcon from '@mui/icons-material/Label';

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
            <Accordion
              key={schedule.id}
              expanded={expanded === schedule.id}
              onChange={handleChange(schedule.id)}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`schedule-${schedule.id}-header`}
                id={`schedule-${schedule.id}-header`}
              >
                <Typography sx={{ width: '40%', flexShrink: 0 }}>
                  { startedAt }
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  予約 {
                    schedule.reservationReceptions.filter(reception =>
                      // キャンセルされていないチケットがある予約
                      reception.reservationTickets.find(ticket =>
                        !ticket.cancelReservationTicket
                      )
                    ).length
                  } 件
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {
                  schedule.reservationReceptions.map(reception => {
                    const totalCount: number = reception.reservationTickets.reduce(ticketCounter, 0);

                    if (totalCount === 0) { return }

                    return (
                      <Grid
                        container
                        spacing={3}
                        key={reception.id}
                        sx={{ borderBottom: 1 }}
                      >
                        <Grid item xs={1} sx={{ my: 'auto' }}>
                          <LabelIcon />
                        </Grid>
                        <Grid item xs={6} sx={{ my: 'auto' }}>
                          { reception.supporter.name }
                        </Grid>
                        <Grid item xs={2} sx={{ my: 'auto' }}>
                          { totalCount }枚
                        </Grid>
                        <Grid item xs={2} sx={{ my: 'auto' }}>
                          <IconButton
                            color='error'
                            onClick={ () => deleteReception(reception)}
                          >
                            <DeleteIcon sx={{ my: 'auto' }} />
                          </IconButton>
                        </Grid>
                      </Grid>
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
