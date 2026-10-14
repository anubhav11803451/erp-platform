// import { PrismaClient, UserRole } from '../generated/prisma/client.ts';
// import * as bcrypt from 'bcrypt';
// import { PrismaPg } from '@prisma/adapter-pg';

// // initialize Prisma Client
// const connectionString = `${process.env.DATABASE_URL}`;
// console.log('Connection String:', connectionString);
// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// async function main() {
//     const hashedPassword = async (password: string) => await bcrypt.hash(password, 10);
//     // create a new Staff
//     const user = await prisma.user.create({
//         data: {
//             first_name: 'John',
//             last_name: 'Doe',
//             email: 'john.doe@erp.com',
//             password: await hashedPassword('john123'),
//             role: UserRole.STAFF,
//         },
//     });
// }

// // execute the main function
// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         // close Prisma Client at the end
//         await prisma.$disconnect();
//     });
