// prisma/seed.ts

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TaskStatus } from '../src/generated/prisma/client';

// initialize Prisma Client with the PostgreSQL driver adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const tasks = [
    {
        title: 'Learn Claude and its commands',
        description:
            'Enroll into the Claude course and complete all their lessons to get it done',
        status: TaskStatus.IN_PROGRESS,
    },
    {
        title: 'Implement task CRUD endpoints',
        description:
            'Build the NestJS RESTful endpoints: create, list, update and delete tasks',
        status: TaskStatus.IN_PROGRESS,
    },
    {
        title: 'Fix docker-compose environment syntax',
        description:
            'Migrate the environment block to map format and declare the postgres volume',
        status: TaskStatus.COMPLETED,
    },
    {
        title: 'Design the Pomodoro timer UI',
        description:
            'Create the Next.js + Shadcn timer screen with work/break cycles and a pomodoro counter per task',
        status: TaskStatus.IN_PROGRESS,
    },
];

async function main() {
    for (const task of tasks) {
        const result = await prisma.task.upsert({
            where: { title: task.title }, // title is @unique, so it's a stable key
            update: {},                   // re-running the seed won't duplicate or overwrite
            create: task,                 // createdAt/updatedAt are filled automatically
        });
        console.log(`Seeded: ${result.title} (${result.status})`);
    }
}

// execute the main function
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // close Prisma Client at the end
        await prisma.$disconnect();
    });
