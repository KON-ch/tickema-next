import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { CancelReservationTicket, ReservationReception, Supporter } from '@prisma/client';

import type { Dispatch, SetStateAction } from 'react';

type Dialog = {
  open: boolean
  reception?: ReservationReception & { supporter: Supporter }
}

type Props = {
  dialog: Dialog
  setDialog: Dispatch<SetStateAction<Dialog>>
  deleteTicket: (cancelTicket: CancelReservationTicket) => Promise<void>
}

const ticketCancel = async (id: number) => {
  try {
    const res = await fetch(`/api/reservations/tickets/${id}`, { method: 'DELETE' });
    return res.json();
  } catch(e) {
    console.error(e);
  }
}

const ReceptionDeleteDialog: React.FC<Props> = ({ dialog, setDialog, deleteTicket }) => {
  const handleClose = () => {
    setDialog({ open: false, reception: undefined });
  };

  const handelDelete = async () => {
    if (!dialog.reception) {
      handleClose
      return;
    }

    const cancelTicket: CancelReservationTicket | void = await ticketCancel(dialog.reception.id)

    cancelTicket && deleteTicket(cancelTicket)
  }

  return (
    <Dialog
      open={dialog.open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {dialog.reception && dialog.reception.supporter.name}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          予約をキャンセルするよ?
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

export default ReceptionDeleteDialog
