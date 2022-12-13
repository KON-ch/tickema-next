import { Controller } from 'react-hook-form';
import type { Control, UseFieldArrayRemove } from 'react-hook-form';

import { TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import type { CreateStageData } from '../types/FormData';

type Props = {
  index: number
  control: Control<CreateStageData>
  year: number
  scheduleRemove: UseFieldArrayRemove
}

const ScheduleStartedAtField: React.FC<Props> = ({
  index,
  control,
  year,
  scheduleRemove
}) => {
    return(
      <div>
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
}

export default ScheduleStartedAtField
