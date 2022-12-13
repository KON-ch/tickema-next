import { useForm, useFieldArray, Controller } from 'react-hook-form';

import { TextField, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import type { CreateStageData } from '../types/FormData';

type Props = {
  onSubmit: (data: CreateStageData) => Promise<void>
}

const StageForm: React.FC<Props> = ({ onSubmit }) => {
  const year = new Date().getFullYear()

  const { control, handleSubmit } = useForm({
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={control}
        rules={{required: '公演名を入力してね'}}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type='text'
            variant='standard'
            autoComplete='off'
            fullWidth
            label='公演タイトル:'
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <div>
        <Button
          type='button'
          variant='outlined'
          size='medium'
          onClick={() => scheduleAppend({ startedAt: `${year}-01-01T12:00` })}
        >
          日程追加
        </Button>
        <div>
          {
            scheduleFields.map((field, index: number) => {
              return(
                <div key={field.id}>
                  <Controller
                    name={`performanceSchedules.${index}.startedAt`}
                    control={control}
                    rules={{required: true}}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type='datetime-local'
                        label={`公演日程${index + 1}`}
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
                  <IconButton
                    color='error'
                    size='large'
                    onClick={ ()=>{ scheduleRemove(index); }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
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
                <div key={field.id}>
                  <Controller
                    name={`saleTickets.${index}.type`}
                    control={control}
                    rules={{required: true}}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type='text'
                        label={`チケット情報${index + 1}`}
                        inputProps={{
                          minLength: 1,
                          maxLength: 255,
                        }}
                        error={!!fieldState.error?.message}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    name={`saleTickets.${index}.price`}
                    control={control}
                    rules={{required: true}}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        type='number'
                        label={`種類${index + 1}`}
                        inputProps={{
                          min: 0,
                          max: 9999,
                        }}
                        error={!!fieldState.error?.message}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                  <Button
                    variant='text'
                    color='error'
                    size='small'
                    startIcon={<DeleteIcon />}
                    onClick={ ()=>{ saleTicketRemove(index); }}
                  >
                    削除
                  </Button>
                </div>
              )
            })
          }
          </div>
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
