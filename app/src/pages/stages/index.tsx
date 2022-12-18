import type { NextPage, GetServerSideProps } from 'next';

import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

import { useState } from 'react';

import StageScheduleLink from '../../components/StageSchedulesLink';
import StageForm from '../../components/StageForm';

import type { CreateStageData } from '../../types/FormData';
import { AppearanceStage } from '@prisma/client';

import { Container} from '@mui/system';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

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
    where: { appearanceUserId: user.id },
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

      setAppearanceStages([result, ...appearanceStages]);
    } catch(e) {
      console.error(e);
    }
  };

  const [appearanceStages, setAppearanceStages] = useState(stages);

  const stageLink = (stage: AppearanceStage) => {
    return (
      <ListItem>
        <StageScheduleLink stage={stage} key={stage.id}>
          <ListItemIcon>
            <LaunchIcon />
          </ListItemIcon>
        </StageScheduleLink>
        <ListItemText primary={stage.title} />
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
