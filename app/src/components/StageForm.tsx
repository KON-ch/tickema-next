import { useForm, useFieldArray } from 'react-hook-form';

import StageTitleField from './StageTitleField';
import ScheduleStartedAtField from './ScheduleStartedAtField';
import SaleTicketFields from './SaleTicketFields';

import { Button } from '@mui/material';

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
      <StageTitleField control={control} />
      <div>
        <Button
          type='button'
          variant='outlined'
          size='medium'
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
      <div>
        <Button
          type='button'
          variant='outlined'
          size='medium'
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
      <Button
        type='submit'
        variant='contained'
        color='success'
        size='large'
      >
        登録
      </Button>
    </form>
  )
}

export default StageForm
