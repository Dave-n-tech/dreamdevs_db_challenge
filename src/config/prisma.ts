import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from "../generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
    accelerateUrl: process.env.ACCELERATE_URL as string,
    log: ["query", "info", "warn", "error"],
}).$extends(withAccelerate());

export default prisma;
