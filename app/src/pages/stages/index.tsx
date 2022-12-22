import type { NextPage, GetServerSideProps } from 'next';

import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

import { useState } from 'react';

import StageScheduleLink from '../../components/StageSchedulesLink';
import StageForm from '../../components/StageForm';

import type { CreateStageData } from '../../types/FormData';
import { AppearanceStage, DeleteAppearanceStage } from '@prisma/client';

import { Container} from '@mui/system';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getSession(ctx)

  if (!session) {
    return { props: {} }
  }

  const user = await prisma.appearanceUser.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      id: true
    }
  })

  if (!user) {
    return {
      redirect: {
        permanent: true,
        destination: '/'
      }
    }
  }

  const stages = await prisma.appearanceStage.findMany({
    where: {
      appearanceUserId: user.id,
      deleteAppearanceStage: null,
    },
    select: {
      id: true,
      title: true
    },
    orderBy: { id: 'desc' }
  });

  return { props: { stages, appearanceUserId: user.id } };
};

type StageProps = {
  stages: AppearanceStage[]
  appearanceUserId: number
};

const Page: NextPage<StageProps> = ({ stages, appearanceUserId }) => {
  const formSubmit = async (data: CreateStageData) => {
    const endpoint = '/api/stages';

    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        performanceSchedules: data.performanceSchedules.map(s => {
          const date = new Date(s.startedAt)
          date.setHours(date.getHours() + 9) // ISOString変換されるため、日本時刻9時間を追加
          return { startedAt: date }
        }),
        saleTickets: data.saleTickets,
        appearanceUserId: appearanceUserId
      }),
    };

    try {
      const res = await fetch(endpoint, options);
      const result: AppearanceStage = await res.json();

      setAppearanceStages(stages => [result, ...stages]);
    } catch(e) {
      console.error(e);
    }
  };

  const [appearanceStages, setAppearanceStages] = useState(stages);

  const handleDeleteStage = async (stageId: number) => {
    try {
      const res = await fetch(`/api/stages/${stageId}`, { method: 'DELETE' });
      const deleteStage: DeleteAppearanceStage = await res.json();

      setAppearanceStages(stages => {
        return stages.filter(stage => stage.id !== deleteStage.appearanceStageId)
      });
    } catch(e) {
      console.error(e);
    }
  }

  const stageLink = (stage: AppearanceStage) => {
    return (
      <ListItem key={stage.id}>
        <StageScheduleLink stage={stage}>
          <ListItemIcon>
            <LaunchIcon />
          </ListItemIcon>
        </StageScheduleLink>
        <ListItemText primary={stage.title} />
        <ListItemIcon>
          <DeleteIcon
            color='error'
            onClick={() => handleDeleteStage(stage.id)}
          />
        </ListItemIcon>
      </ListItem>
    )
  }

  return (
    <Container sx={{ p: 2 }}>
      <h1>公演情報</h1>
      <StageForm onSubmit={formSubmit} />
      <List>
        {appearanceStages.map(stageLink)}
      </List>
    </Container>
  );
};

export default Page
