import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { ListLeadsQueryDto } from './dto/list-leads-query.dto'
import { LeadSource, LeadStatus, Prisma } from '@prisma/client'

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  // público (site)
  async createPublic(garageSlug: string, dto: CreateLeadDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Informe pelo menos e-mail ou telefone.')
    }

    const garage = await this.prisma.garage.findUnique({
      where: { slug: garageSlug },
      select: { id: true },
    })

    if (!garage) {
      throw new NotFoundException('Garagem não encontrada')
    }

    let vehicleId: string | null = null

    if (dto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findFirst({
        where: {
          id: dto.vehicleId,
          garageId: garage.id,
          deletedAt: null,
        },
        select: { id: true },
      })

      if (!vehicle) {
        throw new NotFoundException('Veículo não encontrado para esta garagem')
      }

      vehicleId = vehicle.id
    }

    const lead = await this.prisma.lead.create({
      data: {
        garageId: garage.id,
        vehicleId,
        name: dto.name.trim(),
        email: dto.email?.trim(),
        phone: dto.phone?.trim(),
        message: dto.message?.trim(),
        consentLgpd: dto.consentLgpd,
        status: LeadStatus.NEW,
        source: LeadSource.FORM,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        createdAt: true,
      },
    })

    return lead
  }

  // admin (garagista logado)
  async listForGarage(garageId: string, q: ListLeadsQueryDto) {
    const page = q.page ?? 1
    const pageSize = Math.min(q.pageSize ?? 20, 100)

    const where: Prisma.LeadWhereInput = {
      garageId,
      OR: q.q
        ? [
            { name: { contains: q.q, mode: 'insensitive' } },
            { email: { contains: q.q, mode: 'insensitive' } },
            { phone: { contains: q.q, mode: 'insensitive' } },
          ]
        : undefined,
    }

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          message: true,
          status: true,
          createdAt: true,
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              version: true,
              yearModel: true,
            },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ])

    return {
      items,
      page,
      pageSize,
      total,
    }
  }
}
