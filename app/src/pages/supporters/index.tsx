import type { NextPage, GetServerSideProps } from 'next';

import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

import { useState } from 'react';

import type { CreateSupporterData } from '../../types/FormData';
import { Supporter } from '@prisma/client';

import { Container} from '@mui/system';
import { List, ListItem, ListItemText } from '@mui/material';

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

  const supporters = await prisma.supporter.findMany({
    where: {
      appearanceUserId: user.id
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { id: 'desc' }
  });

  return { props: { supporters, appearanceUserId: user.id } };
};

type SupporterProps = {
  supporters: Supporter[]
  appearanceUserId: number
};

const Page: NextPage<SupporterProps> = (props) => {
  const formSubmit = async (data: CreateSupporterData) => {
    const endpoint = '/api/supporters';

    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        appearanceUserId: props.appearanceUserId
      }),
    };

    try {
      const res = await fetch(endpoint, options);
      const result: Supporter = await res.json();

      setSupporters(supporters => [...supporters, result]);
    } catch(e) {
      console.error(e);
    }
  };

  const [supporters, setSupporters] = useState(props.supporters);

  const supporterListItem = (supporter: Supporter) => {
    return (
      <ListItem key={supporter.id}>
        <ListItemText primary={supporter.name} sx={{ borderBottom: 1 }} />
      </ListItem>
    )
  }

  return (
    <Container sx={{ p: 2 }}>
      <h1>応援者情報</h1>
      <List>
        {supporters.map(supporterListItem)}
      </List>
    </Container>
  );
};

export default Page
