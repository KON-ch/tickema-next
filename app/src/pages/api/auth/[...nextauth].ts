import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { AppearanceUserAdapter } from '../../../../lib/AppearanceUserAdapter'
import GoogleProvider from "next-auth/providers/google"
import prisma from '../../../../lib/prisma'
import type { NextAuthOptions } from 'next-auth'

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, authOptions);
export default authHandler;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: { ...PrismaAdapter(prisma), ...AppearanceUserAdapter(prisma) },
};
