import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { CreateSupporterData } from '../../../types/FormData';


async function postSupporters(
  req: NextApiRequest, res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(400).json({
      message: 'You must be signed in to view the protected content on this page.',
    });
    return;
  }

  const data: CreateSupporterData & { appearanceUserId: string } = JSON.parse(JSON.stringify(req.body));

  const appearanceUser = await prisma.appearanceUser.findUnique({
    where: {
      email: session.user.email
    }
  })

  if (!appearanceUser) {
    res.status(400).json({
      message: 'You must be signed in to view the protected content on this page.',
    });
    return;
  }

  if (data.appearanceUserId !== appearanceUser.id) {
    res.status(400).json({
      message: 'error user different',
    });
    return;
  }

  const postData = {
    name: data.name,
    appearanceUserId: appearanceUser.id,
  }

  try {
    const appearanceStage = await prisma.supporter.create({
      data: postData,
    })
    res.status(201).json(appearanceStage);
  } catch(error) {
    res.status(400).json(error);
  }
}

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'POST':
      postSupporters(req, res);
      break;
    default:
      res.status(400);
  }
}

export default handler;
