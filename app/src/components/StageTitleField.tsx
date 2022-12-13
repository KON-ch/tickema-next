import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { TextField } from '@mui/material';

import type { CreateStageData } from '../types/FormData';

type Props = {
  control: Control<CreateStageData>
}

const StageTitleField: React.FC<Props> = ({ control }) => {
  return (
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
  )
}

export default StageTitleField
