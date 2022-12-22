import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { AppearanceStage, DeleteAppearanceStage } from '@prisma/client';

import type { Dispatch, SetStateAction } from 'react';

type Dialog = {
  open: boolean
  stage?: AppearanceStage
}

type Props = {
  dialog: Dialog
  setDialog: Dispatch<SetStateAction<Dialog>>
  deleteStage: (deleteStage: DeleteAppearanceStage) => void
}

const stageDelete:  (stage: AppearanceStage) => Promise<DeleteAppearanceStage | void> = async (stage: AppearanceStage) => {
  try {
    const res = await fetch(`/api/stages/${stage.id}`, { method: 'DELETE' });
    return res.json();
  } catch(e) {
    console.error(e);
  }
};

const StageDeleteDialog: React.FC<Props> = ({ dialog, setDialog, deleteStage }) => {
  const handleClose = () => {
    setDialog({ open: false, stage: undefined });
  };

  const handelDelete = async () => {
    if (!dialog.stage) {
      handleClose
      return;
    }

    const deletedStage = await stageDelete(dialog.stage);

    deletedStage && deleteStage(deletedStage);

    handleClose();
  }

  return (
    <Dialog
      open={dialog.open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {dialog.stage && dialog.stage.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          公演情報を削除するよ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>NO</Button>
        <Button
          onClick={handelDelete}
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StageDeleteDialog
