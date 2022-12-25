import type { NextPage, GetServerSideProps } from 'next';

import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

import { useState } from 'react';

import type { CreateSupporterData } from '../../types/FormData';
import { Supporter } from '@prisma/client';

import { Container} from '@mui/system';
import { AppBar, List, ListItem, ListItemText, Toolbar, Typography } from '@mui/material';

import DrawerMenu from '../../components/DrawerMenu';

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
    <>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            応援者情報
          </Typography>
          <DrawerMenu />
        </Toolbar>
      </AppBar>
      <Container sx={{ p: 2 }}>
        <List>
          {supporters.map(supporterListItem)}
        </List>
      </Container>
    </>
  );
};

export default Page
