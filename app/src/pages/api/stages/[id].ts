import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { DeleteAppearanceStage } from '@prisma/client';

async function deleteStages(
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

  const { id } = req.query

  const appearanceStage = await prisma.appearanceStage.findUnique({
    where: {
      id: Number(id)
    }
  })

  if (!appearanceUser || appearanceUser.id !== appearanceStage?.appearanceUserId) {
    res.status(400).json({
      message: 'You must be signed in to view the protected content on this page.',
    });
    return;
  }

  try {
    const date = new Date()
    date.setHours(date.getHours() + 9)

    const deleteAppearanceStages: DeleteAppearanceStage = await prisma.deleteAppearanceStage.create({
      data: {
        appearanceStageId: appearanceStage.id,
        deletedAt: date
      }
    })
    res.status(200).json(deleteAppearanceStages);
  } catch(error) {
    res.status(400).json(error);
  }
}

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'DELETE':
      deleteStages(req, res);
      break;
    default:
      res.status(400);
  }
}

export default handler;
