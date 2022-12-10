import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

type AppearanceStage = {
  id: number
  title: String
}

type SaleTicket = {
  type: string
  price: number
}

async function getStages(
  req: NextApiRequest, res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(400).json({
      message: 'You must be signed in to view the protected content on this page.',
    });
    return;
  }

  const appearanceUser = await prisma.appearanceUser.findUnique({
    where: {
      email: session.user.email
    }
  })

  try {
    const AppearanceStages: AppearanceStage[] = await prisma.AppearanceStage.findMany({
      where: {
        appearanceUserId: appearanceUser.id
      },
      select: {
        id: true,
        title: true
      }
    })
    res.status(200).json(AppearanceStages);
  } catch(error) {
    res.status(400).json(error);
  }
}

async function postStages(
  req: NextApiRequest, res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(400).json({
      message: 'You must be signed in to view the protected content on this page.',
    });
    return;
  }

  const data = JSON.parse(JSON.stringify(req.body));

  const appearanceUser = await prisma.appearanceUser.findUnique({
    where: {
      email: session.user.email
    }
  })

  if (data.appearanceUserId !== appearanceUser.id) {
    res.status(400).json({
      message: 'error user different',
    });
    return;
  }

  const postData = {
    title: data.title,
    appearanceUserId: appearanceUser.id,
    performanceSchedules: {
      create: data.performanceSchedules
    },
    saleTickets: {
      create: data.saleTickets.map((d: SaleTicket) => {
        return { type: d.type, price: Number(d.price) }
      })
    }
  }

  try {
    const appearanceStage = await prisma.AppearanceStage.create({
      data: postData,
    })
    res.status(201).json(appearanceStage);
  } catch(error) {
    res.status(400).json(error);
  }
}

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'GET':
      getStages(req, res);
      break;
    case 'POST':
      postStages(req, res);
      break;
    default:
      res.status(400);
  }
}

export default handler;
