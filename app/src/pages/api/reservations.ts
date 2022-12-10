import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

type ReservationTicket = {
  id?: number
  count: number
}

type ReservationForm = {
  id?: number
  receiveType: number
  receptionAt: Date
  supporterId: number
  performanceScheduleId: number
  reservationTickets: ReservationTicket[]
}

async function postReservation(
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
    receiveType: data.receiveType,
    receptionAt: data.receptionAt,
    performanceScheduleId: data.performanceScheduleId,
    supporterId: data.supporterId,
    reservationTickets: {
      create: data.reservationTickets
    }
  }

  try {
    const reservationReception = await prisma.reservationReception.create({
      data: postData,
      include: {
        supporter: true,
        reservationTickets: true
      }
    })
    res.status(201).json(reservationReception);
  } catch(error) {
    res.status(400).json(error);
  }
}

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'POST':
      postReservation(req, res);
      break;
    default:
      res.status(400);
  }
}

export default handler;
