import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateGarageDto } from './dto/update-garage.dto'

@Injectable()
export class GarageService {
  constructor(private prisma: PrismaService) {}

  async getMyGarage(garageId: string) {
    const g = await this.prisma.garage.findUnique({
      where: { id: garageId },
      select: {
        id: true,
        name: true,
        slug: true,
        doc: true,
        phoneWhatsapp: true,
        addressLine: true,
        city: true,
        state: true,
        zip: true,
        website: true,
        instagram: true,
        facebook: true,
        themePrimaryColor: true,
        isPublishEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!g) throw new NotFoundException('Garagem não encontrada')
    return g
  }

  async updateMyGarage(garageId: string, dto: UpdateGarageDto) {
    // Normalizações simples (opcionais)
    const data: UpdateGarageDto = { ...dto }
    if (data.doc) data.doc = data.doc.replace(/\D/g, '')
    if (data.phoneWhatsapp)
      data.phoneWhatsapp = data.phoneWhatsapp.replace(/\D/g, '')

    return this.prisma.garage.update({
      where: { id: garageId },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        doc: true,
        phoneWhatsapp: true,
        addressLine: true,
        city: true,
        state: true,
        zip: true,
        website: true,
        instagram: true,
        facebook: true,
        themePrimaryColor: true,
        isPublishEnabled: true,
        updatedAt: true,
      },
    })
  }
}
