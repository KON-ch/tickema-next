import { Controller } from 'react-hook-form';
import type { Control, UseFieldArrayRemove } from 'react-hook-form';

import { TextField, IconButton, Grid } from '@mui/material';
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
    <Grid container spacing={1} sx={{ my: 2 }}>
      <Grid item xs={5}>
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
      </Grid>
      <Grid item xs={5}>
        <Controller
          name={`saleTickets.${index}.price`}
          control={control}
          rules={{required: true}}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              type='number'
              label={`金額${index + 1}`}
              inputProps={{
                min: 0,
                max: 9999,
              }}
              error={!!fieldState.error?.message}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={1}>
        <IconButton
          color='error'
          size='large'
          onClick={ ()=>{ saleTicketRemove(index); }}
        >
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default SaleTicketFields
