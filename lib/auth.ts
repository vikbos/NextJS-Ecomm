import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas";
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
        credentials: {
            email: {},
            password: {},
        },
        async authorize(credentials) {
            const parsedCredentials = LoginSchema.safeParse(credentials)
            if (!parsedCredentials.success) {
                console.log("Invalid credentials format")
                return null
            }

            const { email, password } = parsedCredentials.data

            try {
                const user = await prisma.user.findUnique({
                    where: { email },
                })

                if (!user) {
                    console.log("No user found with this email")
                    return null
                }

                const passwordMatch = await comparePasswords(password, user.password)

                if (!passwordMatch) {
                    console.log("Password does not match")
                    return null
                }

                return user
            } catch (e) {
                console.error("Error finding user:", e)
                return null
            }
        }
    })
  ],
});

export async function hashPassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds)
}

export async function comparePasswords(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword)
}
