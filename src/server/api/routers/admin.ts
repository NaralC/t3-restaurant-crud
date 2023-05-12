/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/await-thenable */
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { getJwtSecret } from "~/lib/auth";
import cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { s3 } from "~/lib/s3";
import { MAX_FILE_SIZE } from "~/constants/config";

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
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("user-token", token, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
          })
        );

        return {
          success: true,
        };
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email/password",
      });
    }),

  // sensitive: adminProcedure.mutation(() => {
  //   return "sensitive";
  // })
  createPresignedUrl: adminProcedure
    .input(
      z.object({
        fileType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const id = nanoid();
      const ex = input.fileType.split("/")[1]; // นามสกุลไฟล์
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const key = `${id}.${ex}`;

      const { url, fields } = await new Promise((resolve, reject) => {
        s3.createPresignedPost({
          Bucket: "restaurant-app-t3",
          Fields: { key },
          Expires: 60,
          Conditions: [
            ["content-length-range", 0, MAX_FILE_SIZE],
            ["starts-with", "$Content-Type", "image/"],
          ],
        },
        
        (err, data) => {
          if (err) return reject(err);
          resolve(data);
        }

        );
      }) as any as { url: string; fields: any };

      return { url, fields, key }
    }),

  addMenuItem: adminProcedure.input(z.object({
    name: z.string(),
    price: z.number(),
    imageKey: z.string(),
    categories: z.array(z.union([z.literal('breakfast'), z.literal('lunch'), z.literal('dinner')]))
  }))
  .mutation(async ({ ctx, input }) => {
    const { name, price, imageKey, categories } = input;
    const menuItem = await ctx.prisma.menuItem.create({
      data: {
        name, price, imageKey, categories
      }
    })

    return menuItem;
  }),

  deleteMenuItem: adminProcedure.input(z.object({
    imageKey: z.string(),
    id: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    // Delete the image from S3 bucket
    const { id, imageKey } = input
    await s3.deleteObject({
      Bucket: "restaurant-app-t3",
      Key: imageKey
    }).promise();

    // Delete the image from CockRoachDB
    const menuItem = await ctx.prisma.menuItem.delete({
      where: { id }
    })

    return menuItem;
  })
});
