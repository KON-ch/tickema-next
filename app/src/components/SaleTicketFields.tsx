import { Controller } from 'react-hook-form';
import type { Control, UseFieldArrayRemove } from 'react-hook-form';

import { TextField, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import type { CreateStageData } from '../types/FormData';

type Props = {
  index: number
  control: Control<CreateStageData>
  saleTicketRemove: UseFieldArrayRemove
}

const SaleTicketFields: React.FC<Props> = ({
  index,
  control,
  saleTicketRemove
}) => {
  return (
    <div>
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
}

export default SaleTicketFields
