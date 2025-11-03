import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function run() {
  const passwordHash = await bcrypt.hash('admin123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'owner@garagem.com' },
    update: {},
    create: {
      email: 'owner@garagem.com',
      passwordHash,
      name: 'Owner',
    },
  })

  const garage = await prisma.garage.upsert({
    where: { slug: 'garagem-alto-vale' },
    update: {},
    create: {
      name: 'Garagem Alto Vale',
      slug: 'garagem-alto-vale',
      isPublishEnabled: true,
      city: 'Rio do Sul',
      state: 'SC',
    },
  })

  await prisma.garageUser.upsert({
    where: { garageId_userId: { garageId: garage.id, userId: user.id } },
    update: {},
    create: { garageId: garage.id, userId: user.id, role: 'OWNER' },
  })

  await prisma.vehicle.createMany({
    data: [
      {
        garageId: garage.id,
        brand: 'Chevrolet',
        model: 'Onix',
        yearFabrication: 2019,
        yearModel: 2019,
        fuel: 'FLEX',
        gearbox: 'MANUAL',
        status: 'IN_STOCK',
        priceOnRequest: false,
        price: null,
      },
    ],
    skipDuplicates: true,
  })
  console.log('Seed ok:', { user: user.email, garage: garage.slug })
}

run().finally(() => prisma.$disconnect())
