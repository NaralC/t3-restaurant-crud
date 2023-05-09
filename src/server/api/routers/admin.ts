/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/await-thenable */
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { getJwtSecret } from "~/lib/auth";
import cookie from 'cookie';
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { res } = ctx;
      const { email, password } = input;

      if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
      ) {
        // user is authenticated as admin

        const token = await new SignJWT({})
          .setProtectedHeader({
            alg: "HS256",
          })
          .setJti(nanoid())
          .setIssuedAt()
          .setExpirationTime("1h")
          .sign(new TextEncoder().encode(getJwtSecret()));

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          res.setHeader("Set-Cookie", cookie.serialize('user-token', token, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production"
          }))

          return {
            success: true
          }
      }

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: "Invalid email/password"
      })
    }),

    sensitive: adminProcedure.mutation(() => {
      return "sensitive";
    })
});
