import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { TextField } from '@mui/material';
import Slide from '@mui/material/Slide';
import DeleteIcon from '@mui/icons-material/Delete';
import { TransitionProps } from '@mui/material/transitions';

import { Dispatch, SetStateAction, ReactElement, Ref, useEffect, useState } from 'react';
import { forwardRef } from 'react';

import CreatableSelect from 'react-select/creatable';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import MuiSelect from '@mui/material/Select';

import { locateSchedule } from '../utils/locate';

import { useForm, Controller, useFieldArray } from 'react-hook-form';

import { PerformanceSchedule, ReservationReception, SaleTicket, Supporter } from '@prisma/client';

type Props = {
  dialog: boolean
  setDialog: Dispatch<SetStateAction<boolean>>
  scheduleReceptions: PerformanceSchedule[]
  saleTickets: SaleTicket[]
  supporters: Supporter[]
  appearanceUserId: string
  formSubmit: (reservation: ReservationReception) => void
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type CreateReceptionData = {
  receiveType: number
  receptionAt: string | Date
  supporterId?: number
  performanceScheduleId: number
  reservationTickets: {
    saleTicketId: number,
    count: number
  }[]
}

const createReservation= async (data: CreateReceptionData, appearanceUserId: string) => {
  if (!data.supporterId) { return; }

  const endpoint = '/api/reservations';

  const options = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      receptionAt: new Date(data.receptionAt),
      appearanceUserId: appearanceUserId
    }),
  };

  try {
    const res = await fetch(endpoint, options);
    return res.json();
  } catch(e) {
    console.error(e);
  }
}

const ReceptionCreateDialog: React.FC<Props> = ({
  dialog, setDialog, saleTickets, scheduleReceptions, supporters, appearanceUserId, formSubmit
}) => {
  const handleClose = () => {
    setDialog(false);
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1) < 10 ? `0${today.getMonth()}` : today.getMonth() + 1;
  const date = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();

  const { control, handleSubmit, reset, setValue } = useForm<CreateReceptionData>({
    defaultValues: {
      receiveType: 1,
      receptionAt: `${year}-${month}-${date}`,
      supporterId: undefined,
      performanceScheduleId: scheduleReceptions[0].id,
      reservationTickets: [
        { saleTicketId: saleTickets[0].id, count: 1 }
      ]
    }
  });

  useEffect(() => {
    setValue('performanceScheduleId', scheduleReceptions[0].id)
    setValue('reservationTickets', [{ saleTicketId: saleTickets[0].id, count: 1 }])
  }, [scheduleReceptions, saleTickets, setValue])

  const {
    fields: ticketFields,
    append: ticketAppend,
    remove: ticketRemove
  } = useFieldArray({
    control,
    rules: { minLength: 1 },
    name: 'reservationTickets',
  });

  type SupporterOption = {
    value: number
    label: string
  }

  const [supporterOptions, setSupporterOptions] = useState<SupporterOption[]>(
    supporters.map(supporter => {
      return { value: supporter.id, label: supporter.name }
    })
  )

  const handleCreateReception = handleSubmit( async (data) => {
    const reservation: ReservationReception | void = await createReservation(data, appearanceUserId)

    reservation && formSubmit(reservation);

    reset();
    handleClose();
  })

  const handleCreateSupporter = async (inputValue: string) => {
    const options = {
      method: 'POST',
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: inputValue, appearanceUserId: appearanceUserId })
    }

    const res = await fetch('/api/supporters', options);
    const supporter = await res.json();

    setSupporterOptions(options => [...options, { value: supporter.id, label: supporter.name }])
  }

  return (
    <>
      <Dialog
        fullScreen
        open={dialog}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              ???????????????????????????
            </Typography>
          </Toolbar>
        </AppBar>
        <form onSubmit={handleCreateReception}>
          <List sx={{ p: 2 }}>
            <ListItem>
              <Controller
                name="supporterId"
                control={control}
                rules={{required: true}}
                render={({ field }) => (
                  <CreatableSelect
                    isClearable
                    onCreateOption={handleCreateSupporter}
                    styles={{
                      container: provided => ({
                        ...provided,
                        width: 300,
                        marginBottom: 10
                      }),
                      menu: provided => ({
                        ...provided,
                        zIndex: 9999
                      })
                    }}
                    value={supporterOptions.find((supporter) => supporter.value === field.value)}
                    onChange={(ev) => { field.onChange(ev?.value) }}
                    options={supporterOptions}
                  />
                )}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <Controller
                name="performanceScheduleId"
                control={control}
                rules={{required: true}}
                render={({ field, fieldState }) => (
                  <FormControl variant="standard" required sx={{ minWidth: 300 }} error={!!fieldState.error?.message}>
                    <InputLabel id="schedule-select-label">?????????</InputLabel>
                    <MuiSelect
                      labelId="schedule-select-label"
                      label="?????????"
                      {...field}
                    >
                      {
                        scheduleReceptions.map(schedule => {
                          return (
                            <MenuItem value={schedule.id} key={schedule.id}>{locateSchedule(schedule)}</MenuItem>
                          )
                        })
                      }
                    </MuiSelect>
                  </FormControl>
                )}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <Controller
                name="receiveType"
                control={control}
                rules={{required: true}}
                render={({ field, fieldState }) => (
                  <FormControl variant="standard" required sx={{ m: 1, minWidth: 150 }} error={!!fieldState.error?.message}>
                    <InputLabel id="receive-type-select-label">????????????</InputLabel>
                    <MuiSelect
                      labelId="receive-type-select-label"
                      label="????????????"
                      {...field}
                    >
                      <MenuItem value={1}>??????</MenuItem>
                      <MenuItem value={2}>??????</MenuItem>
                    </MuiSelect>
                  </FormControl>
                )}
              />
              <Controller
                name="receptionAt"
                control={control}
                rules={{required: true}}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type='date'
                    label="???????????????"
                    inputProps={{
                      min: `${year}-01-01T00:00`,
                      max: `${year + 1}-12-31T00:00`,
                      pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}'
                    }}
                    error={!!fieldState.error?.message}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </ListItem>
            <Divider />
            <Button
              type='button'
              variant='outlined'
              size='medium'
              sx={{ mt: 2, ml: 2, display: 'block' }}
              onClick={() => ticketAppend({ saleTicketId: saleTickets[0].id, count: 1 })}
            >
              ????????????
            </Button>
              {
                ticketFields.map((field, index: number) => {
                  return (
                    <ListItem key={field.id}>
                      <Controller
                        name={`reservationTickets.${index}.saleTicketId`}
                        control={control}
                        rules={{required: true}}
                        render={({ field, fieldState }) => (
                          <FormControl variant="standard" required sx={{ m: 1, minWidth: 120 }} error={!!fieldState.error?.message}>
                            <InputLabel id="sale-ticket-select-label">????????????</InputLabel>
                            <MuiSelect
                              labelId="sale-ticket-select-label"
                              label="????????????"
                              {...field}
                            >
                              {
                                saleTickets.map(ticket => {
                                  return (
                                    <MenuItem value={ticket.id} key={ticket.id}>{ticket.type}</MenuItem>
                                  )
                                })
                              }
                            </MuiSelect>
                          </FormControl>
                        )}
                      />
                      <Controller
                        name={`reservationTickets.${index}.count`}
                        control={control}
                        rules={{required: true}}
                        render={({ field, fieldState }) => (
                          <FormControl variant="standard" required sx={{ m: 1, minWidth: 120 }} error={!!fieldState.error?.message}>
                            <InputLabel id="count-select-label">????????????</InputLabel>
                            <MuiSelect
                              labelId="count-select-label"
                              label="????????????"
                              {...field}
                            >
                              <MenuItem value={1}>1</MenuItem>
                              <MenuItem value={2}>2</MenuItem>
                              <MenuItem value={3}>3</MenuItem>
                              <MenuItem value={4}>4</MenuItem>
                              <MenuItem value={5}>5</MenuItem>
                            </MuiSelect>
                          </FormControl>
                        )}
                      />
                      <IconButton
                        color='error'
                        size='large'
                        onClick={ ()=>{ ticketRemove(index); }}
                      >
                        <DeleteIcon />
                      </IconButton>
                  </ListItem>
                  )
                })
              }
          </List>
          <Button type='submit' variant='contained' color='success' sx={{ display: 'block', mx: 'auto', mt: 3, width: 250 }} >
            ??????
          </Button>
        </form>
      </Dialog>
    </>
  );
}

export default ReceptionCreateDialog
