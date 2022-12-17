import { Fragment, useState, KeyboardEvent, MouseEvent } from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
import InboxIcon from '@mui/icons-material/MoveToInbox';

import type { AppearanceStage } from '@prisma/client';
import StageScheduleLink from './StageSchedulesLink';

import Link from "next/link";

type Props = {
  currentStageId?: number
}

const DrawerMenu: React.FC<Props> = ({ currentStageId }) => {
  const [state, setState] = useState<{
    open: boolean
    stages: AppearanceStage[]}
  >({
    open: false,
    stages: []
  });

  const getStages = async () => {
    const res = await fetch('/api/stages', { method: 'GET' });
    return res.json();
  };

  const toggleDrawer = async (open: boolean) => {
    if (!open) {
      setState({ ...state, open: open });
    }

    const stages: AppearanceStage[] = await getStages();
    setState({ stages: stages, open: open });
  };

  const stageLists = (stage: AppearanceStage) => {
    if (stage.id === currentStageId) { return; }

    return(
      <StageScheduleLink key={stage.id} stage={stage}>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={stage.title} />
          </ListItemButton>
        </ListItem>
      </StageScheduleLink>
    );
  };

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={() => toggleDrawer(false)}
    >
      <List>
        {state.stages.map(stageLists)}
      </List>
      <Divider />
      <List>
        <Link href='/stages/'>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="公演情報登録" />
            </ListItemButton>
          </ListItem>
        </Link>
      </List>
    </Box>
  );

  return (
    <div>
      <Fragment key={'right'}>
        <Button onClick={() => toggleDrawer(true)} color='secondary' variant='contained' >
          ≡
        </Button>
        <Drawer
          anchor={'right'}
          open={state['open']}
          onClose={() => toggleDrawer(false)}
        >
          {list()}
        </Drawer>
      </Fragment>
    </div>
  );
}

export default DrawerMenu
