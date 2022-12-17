import { useForm, useFieldArray } from 'react-hook-form';

import StageTitleField from './StageTitleField';
import ScheduleStartedAtField from './ScheduleStartedAtField';
import SaleTicketFields from './SaleTicketFields';

import { Button, Box, Divider } from '@mui/material';

import type { CreateStageData } from '../types/FormData';

type Props = {
  onSubmit: (data: CreateStageData) => Promise<void>
}

const StageForm: React.FC<Props> = ({ onSubmit }) => {
  const year = new Date().getFullYear()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      performanceSchedules: [
        { startedAt: `${year}-01-01T12:00` }
      ],
      saleTickets: [
        {
          type: '一般' ,
          price: 0,
        }
      ]
    }
  });

  const {
    fields: scheduleFields,
    append: scheduleAppend,
    remove: scheduleRemove
  } = useFieldArray({
    control,
    rules: { minLength: 1 },
    name: 'performanceSchedules',
  });

  const {
    fields: saleTicketFields,
    append: saleTicketAppend,
    remove: saleTicketRemove
  } = useFieldArray({
    control,
    rules: { minLength: 1 },
    name: 'saleTickets',
  });

  return (
    <form onSubmit={handleSubmit((data) => {
      onSubmit(data);
      reset();
    })}>
      <Box
        sx={{ p: 2, boxShadow: 1, border: 1, borderRadius: 2 }}
      >
        <StageTitleField control={control} />
        <Divider />
        <div>
          <Button
            type='button'
            variant='outlined'
            size='medium'
            sx={{ mt: 2 }}
            onClick={() => scheduleAppend({ startedAt: `${year}-01-01T12:00` })}
          >
            日程追加
          </Button>
          {
            scheduleFields.map((field, index: number) => {
              return(
                <ScheduleStartedAtField
                  key={field.id}
                  index={index}
                  control={control}
                  year={year}
                  scheduleRemove={scheduleRemove}
                />
              )
            })
          }
        </div>
        <Divider />
        <div>
          <Button
            type='button'
            variant='outlined'
            size='medium'
            sx={{ mt: 2 }}
            onClick={() => {
              saleTicketAppend(
                {
                  type: '',
                  price: 0,
                }
              )
            }}
          >
            チケット追加
          </Button>
          {
            saleTicketFields.map((field, index: number) => {
              return(
                <SaleTicketFields
                  key={field.id}
                  index={index}
                  control={control}
                  saleTicketRemove={saleTicketRemove}
                />
              )
            })
          }
        </div>
        <Divider />
        <Button
          type='submit'
          variant='contained'
          color='success'
          fullWidth
          sx={{ my: 3 }}
        >
          登録
        </Button>
      </Box>
    </form>
  )
}

export default StageForm
