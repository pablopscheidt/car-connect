import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  list(garageId: string) {
    return this.prisma.vehicle.findMany({
      where: { garageId, status: 'IN_STOCK' },
      select: {
        id: true,
        brand: true,
        model: true,
        yearModel: true,
        price: true,
        status: true,
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 20,
    })
  }
}
