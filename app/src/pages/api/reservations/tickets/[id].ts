import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../../lib/prisma'

type Session = {
  user: {
    email: string
  }
}

async function createCancelTicket(
  req: NextApiRequest, res: NextApiResponse
) {
  const session: Session = await unstable_getServerSession(req, res, authOptions)

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

  const { id } = req.query

  const reservationTicket = await prisma.reservationTicket.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      saleTicket: {
        include: {
          appearanceStage: true
        }
      }
    }
  })

  if (reservationTicket.saleTicket.appearanceStage.appearanceUserId !== appearanceUser.id) {
    res.status(400).json({
      message: 'error user different',
    });
    return;
  }

  try {
    const date = new Date()
    date.setHours(date.getHours() + 9)

    const cancelTicket = await prisma.cancelReservationTicket.create({
      data: {
        canceledAt: date.toISOString(),
        reservationTicketId: reservationTicket.id
      }
    })
    res.status(200).json(cancelTicket);
  } catch(error) {
    res.status(400).json(error);
  }
}

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'DELETE':
      createCancelTicket(req, res);
      break;
    default:
      res.status(400);
  }
}

export default handler;
