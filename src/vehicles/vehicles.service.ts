import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateVehicleDto } from './dto/create-vehicle.dto'
import { UpdateVehicleDto } from './dto/update-vehicle.dto'
import { VehicleFiltersDto } from './dto/filters.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  private validateBusinessRules(dto: {
    priceOnRequest: boolean
    price?: number
    yearModel?: number
    yearFabrication?: number
  }) {
    const { priceOnRequest, price, yearFabrication, yearModel } = dto

    // RN-06
    if (yearFabrication && yearModel && yearModel < yearFabrication) {
      throw new BadRequestException('yearModel deve ser >= yearFabrication')
    }
    // RN-02 / RN-04
    if (!priceOnRequest && (price === undefined || price === null)) {
      throw new BadRequestException(
        'price é obrigatório quando priceOnRequest=false',
      )
    }
  }

  async create(garageId: string, userId: string, dto: CreateVehicleDto) {
    this.validateBusinessRules(dto)

    // normalizar filtro/strings se quiser (ex.: trim)
    const data = {
      ...dto,
      price: dto.price ?? null,
      garageId,
      createdById: userId,
      updatedById: userId,
    }

    // unicidade (garageId, renavam) – só valida se fornecido
    if (dto.renavam) {
      const exists = await this.prisma.vehicle.findFirst({
        where: { garageId, renavam: dto.renavam },
        select: { id: true },
      })
      if (exists)
        throw new BadRequestException('renavam já cadastrado para esta garagem')
    }

    return this.prisma.vehicle.create({ data })
  }

  async update(
    garageId: string,
    userId: string,
    id: string,
    dto: UpdateVehicleDto,
  ) {
    const found = await this.prisma.vehicle.findFirst({
      where: { id, garageId },
    })
    if (!found) throw new NotFoundException('Veículo não encontrado')

    this.validateBusinessRules({
      priceOnRequest: dto.priceOnRequest ?? found.priceOnRequest,
      price: dto.price ?? found.price?.toNumber(),
      yearFabrication: dto.yearFabrication ?? found.yearFabrication,
      yearModel: dto.yearModel ?? found.yearModel,
    })

    return this.prisma.vehicle.update({
      where: { id },
      data: { ...dto, updatedById: userId, price: dto.price ?? found.price },
    })
  }

  async remove(garageId: string, id: string) {
    const found = await this.prisma.vehicle.findFirst({
      where: { id, garageId },
    })
    if (!found) throw new NotFoundException('Veículo não encontrado')
    // soft delete (se preferir)
    return this.prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'SOLD' },
    })
  }

  async get(garageId: string, id: string) {
    return this.prisma.vehicle.findFirst({
      where: { id, garageId },
      include: { images: { orderBy: { position: 'asc' } } },
    })
  }

  async listAdmin(garageId: string, f: VehicleFiltersDto) {
    const page = f.page ?? 1
    const pageSize = Math.min(f.pageSize ?? 20, 100)
    const where: Prisma.VehicleWhereInput = {
      garageId,
      deletedAt: null, // ignore soft-deletados (se usar)
    }

    if (f.status) where.status = f.status
    if (f.brand) where.brand = { contains: f.brand, mode: 'insensitive' }
    if (f.model) where.model = { contains: f.model, mode: 'insensitive' }
    if (f.q) {
      where.OR = [
        { brand: { contains: f.q, mode: 'insensitive' } },
        { model: { contains: f.q, mode: 'insensitive' } },
        { version: { contains: f.q, mode: 'insensitive' } },
      ]
    }
    if (f.minPrice || f.maxPrice) {
      where.price = {}
      if (f.minPrice) where.price.gte = Number(f.minPrice)
      if (f.maxPrice) where.price.lte = Number(f.maxPrice)
    }

    const [items, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          brand: true,
          model: true,
          yearModel: true,
          yearFabrication: true,
          status: true,
          price: true,
          priceOnRequest: true,
          createdAt: true,
        },
      }),
      this.prisma.vehicle.count({ where }),
    ])

    return { items, page, pageSize, total }
  }

  private async ensureVehicle(garageId: string, vehicleId: string) {
    const v = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, garageId },
    })
    if (!v) throw new NotFoundException('Veículo não encontrado')
    return v
  }

  async attachImages(
    garageId: string,
    vehicleId: string,
    items: Array<{ path: string; isCover?: boolean }>,
  ) {
    await this.ensureVehicle(garageId, vehicleId)

    const currentCount = await this.prisma.vehicleImage.count({
      where: { vehicleId },
    })
    let position = currentCount
    const hasCover = items.some((i) => i.isCover)

    return this.prisma.$transaction(async (tx) => {
      if (hasCover) {
        await tx.vehicleImage.updateMany({
          where: { vehicleId, isCover: true },
          data: { isCover: false },
        })
      }

      const created: {
        id: string
        position: number
        url: string
        isCover: boolean
      }[] = []
      for (const it of items) {
        position += 1
        const rec = await tx.vehicleImage.create({
          data: {
            vehicleId,
            url: it.path,
            isCover: !!it.isCover,
            position,
          },
          select: {
            id: true,
            url: true,
            isCover: true,
            position: true,
          },
        })
        created.push(rec)
      }

      if (!hasCover) {
        const alreadyHasCover = await tx.vehicleImage.findFirst({
          where: { vehicleId, isCover: true },
        })
        if (!alreadyHasCover && created.length > 0) {
          await tx.vehicleImage.update({
            where: { id: created[0].id },
            data: { isCover: true },
          })
          created[0].isCover = true
        }
      }

      return created
    })
  }

  async setCover(garageId: string, vehicleId: string, imageId: string) {
    await this.ensureVehicle(garageId, vehicleId)
    const img = await this.prisma.vehicleImage.findFirst({
      where: { id: imageId, vehicleId },
    })
    if (!img) throw new NotFoundException('Imagem não encontrada')

    await this.prisma.$transaction([
      this.prisma.vehicleImage.updateMany({
        where: { vehicleId, isCover: true },
        data: { isCover: false },
      }),
      this.prisma.vehicleImage.update({
        where: { id: imageId },
        data: { isCover: true },
      }),
    ])
    return { ok: true }
  }

  async removeImage(garageId: string, vehicleId: string, imageId: string) {
    await this.ensureVehicle(garageId, vehicleId)
    const img = await this.prisma.vehicleImage.findFirst({
      where: { id: imageId, vehicleId },
    })
    if (!img) throw new NotFoundException('Imagem não encontrada')

    await this.prisma.vehicleImage.delete({ where: { id: imageId } })
    return { ok: true }
  }

  listImages(garageId: string, vehicleId: string) {
    return this.prisma.vehicleImage.findMany({
      where: { vehicleId, vehicle: { garageId } },
      orderBy: { position: 'asc' },
      select: { id: true, url: true, isCover: true, position: true },
    })
  }
}
