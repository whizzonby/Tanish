import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function isRateLimited(email: string, ip: string) {
  const since = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MS);
  const recentFailures = await prisma.loginAttempt.count({
    where: {
      email,
      ip,
      success: false,
      createdAt: { gte: since },
    },
  });
  return recentFailures >= MAX_FAILED_ATTEMPTS;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const ip = getClientIp(request);

        if (!email || !password) return null;

        if (await isRateLimited(email, ip)) {
          throw new Error("Too many failed login attempts. Please try again later.");
        }

        const admin = await prisma.adminUser.findUnique({ where: { email } });
        const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

        await prisma.loginAttempt.create({ data: { email, ip, success: valid } });

        if (!admin || !valid) return null;

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return { id: admin.id, email: admin.email, role: admin.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
