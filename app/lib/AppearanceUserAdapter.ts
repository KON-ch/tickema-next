import type { PrismaClient } from "@prisma/client"
import type { Adapter } from "next-auth/adapters"

type User = {
  id: string
  name: string
  email: string
  image: string
}

export function AppearanceUserAdapter(p: PrismaClient): Adapter {
  return {
    createUser: (data: User) => {
      const allowedUsers = process.env.ALLOWED_USERS?.split(',') || [];

      if (allowedUsers.includes(data.email)) {
        return p.appearanceUser.create({ data });
      }
    },
    getUser: (id: string) => p.appearanceUser.findUnique({ where: { id } }),
    getUserByEmail: (email: string) => p.appearanceUser.findUnique({ where: { email } }),
    updateUser: ({ id, ...data }: User) => p.appearanceUser.update({ where: { id }, data }),
    deleteUser: (id: string) => p.appearanceUser.delete({ where: { id } }),
  }
}
