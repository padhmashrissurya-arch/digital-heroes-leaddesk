import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const adminEmail = 'admin@leaddesk.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('AdminSecret123!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'LeadDesk Admin',
        passwordHash,
      },
    });
    console.log(`Default admin created: ${adminEmail} / AdminSecret123!`);
  } else {
    console.log('Default admin already exists.');
  }

  // Create initial sample leads if empty
  const leadCount = await prisma.lead.count();
  if (leadCount === 0) {
    await prisma.lead.createMany({
      data: [
        {
          name: 'Sarah Connor',
          email: 'sarah@cyberdyne-defense.com',
          budget: '$10k - $25k',
          message: 'Looking for a custom CRM dashboard for our consulting team.',
          status: 'NEW',
        },
        {
          name: 'Alexander Wright',
          email: 'alex@fintechscale.io',
          budget: '$25k - $50k',
          message: 'We need full-stack developers to rebuild our lead capture flow.',
          status: 'CONTACTED',
        },
        {
          name: 'Elena Rostova',
          email: 'elena@designstudio.org',
          budget: '$5k - $10k',
          message: 'Interested in a website redesign with dynamic lead forms.',
          status: 'CLOSED',
        },
      ],
    });
    console.log('Sample leads created successfully.');
  }

  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
