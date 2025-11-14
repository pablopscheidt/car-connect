// src/public/public.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PublicVehicleFiltersDto } from './dto/public-vehicle-filters.dto'
import { PrismaService } from '../prisma/prisma.service'

type PublicVehicleCard = {
  id: string
  brand: string
  model: string
  version?: string | null
  yearFabrication: number
  yearModel: number
  fuel: string
  gearbox: string
  priceOnRequest: boolean
  price: number | null
  coverUrl: string | null
}

type PublicVehicleDetail = {
  id: string
  brand: string
  model: string
  version?: string | null
  yearFabrication: number
  yearModel: number
  fuel: string
  gearbox: string
  color?: string | null
  description?: string | null
  priceOnRequest: boolean
  price: number | null
  images: Array<{ url: string; isCover: boolean }>
  garage: {
    name: string
    slug: string
    phoneWhatsapp?: string | null
    instagram?: string | null
    website?: string | null
  }
}

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  private toNumber(d: Prisma.Decimal | null): number | null {
    return d === null ? null : Number(d)
  }

  private maskPrice<
    T extends { priceOnRequest: boolean; price: number | null },
  >(obj: T): T {
    if (obj.priceOnRequest) return { ...obj, price: null }
    return obj
  }

  async listVehicles(garageSlug: string, f: PublicVehicleFiltersDto) {
    const page = f.page ?? 1
    const pageSize = Math.min(f.pageSize ?? 20, 100)

    const where: Prisma.VehicleWhereInput = {
      status: 'IN_STOCK',
      garage: { slug: garageSlug },
      deletedAt: null,
    }

    if (f.brand) where.brand = { contains: f.brand, mode: 'insensitive' }
    if (f.model) where.model = { contains: f.model, mode: 'insensitive' }
    if (f.q) {
      where.OR = [
        { brand: { contains: f.q, mode: 'insensitive' } },
        { model: { contains: f.q, mode: 'insensitive' } },
        { version: { contains: f.q, mode: 'insensitive' } },
      ]
    }
    if (f.year) where.yearModel = Number(f.year)

    if (f.minPrice || f.maxPrice) {
      const priceFilter: Prisma.DecimalNullableFilter = { not: null }
      if (f.minPrice) priceFilter.gte = new Prisma.Decimal(f.minPrice)
      if (f.maxPrice) priceFilter.lte = new Prisma.Decimal(f.maxPrice)
      where.price = priceFilter
    }

    const [rows, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          brand: true,
          model: true,
          version: true,
          yearFabrication: true,
          yearModel: true,
          fuel: true,
          gearbox: true,
          priceOnRequest: true,
          price: true,
          images: {
            where: { isCover: true },
            orderBy: { position: 'asc' },
            take: 1,
            select: { url: true },
          },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ])

    const items: PublicVehicleCard[] = rows.map((v) =>
      this.maskPrice({
        id: v.id,
        brand: v.brand,
        model: v.model,
        version: v.version,
        yearFabrication: v.yearFabrication,
        yearModel: v.yearModel,
        fuel: v.fuel,
        gearbox: v.gearbox,
        priceOnRequest: v.priceOnRequest,
        price: this.toNumber(v.price),
        coverUrl: v.images[0]?.url ?? null,
      }),
    )

    return { items, page, pageSize, total }
  }

  async getVehicle(garageSlug: string, id: string) {
    const v = await this.prisma.vehicle.findFirst({
      where: {
        id,
        status: 'IN_STOCK',
        garage: { slug: garageSlug },
        deletedAt: null,
      },
      select: {
        id: true,
        brand: true,
        model: true,
        version: true,
        yearFabrication: true,
        yearModel: true,
        fuel: true,
        gearbox: true,
        color: true,
        description: true,
        priceOnRequest: true,
        price: true,
        images: {
          orderBy: [{ isCover: 'desc' }, { position: 'asc' }],
          select: { url: true, isCover: true },
        },
        garage: {
          select: {
            name: true,
            slug: true,
            phoneWhatsapp: true,
            instagram: true,
            website: true,
          },
        },
      },
    })

    if (!v) throw new NotFoundException('Veículo não encontrado')

    const detail: PublicVehicleDetail = this.maskPrice({
      id: v.id,
      brand: v.brand,
      model: v.model,
      version: v.version,
      yearFabrication: v.yearFabrication,
      yearModel: v.yearModel,
      fuel: v.fuel,
      gearbox: v.gearbox,
      color: v.color,
      description: v.description ?? null,
      priceOnRequest: v.priceOnRequest,
      price: this.toNumber(v.price),
      images: v.images.map((i) => ({ url: i.url, isCover: i.isCover })),
      garage: {
        name: v.garage.name,
        slug: v.garage.slug,
        phoneWhatsapp: v.garage.phoneWhatsapp,
        instagram: v.garage.instagram,
        website: v.garage.website,
      },
    })

    return detail
  }

  async getGaragePublic(garageSlug: string) {
    const g = await this.prisma.garage.findUnique({
      where: { slug: garageSlug },
      select: {
        name: true,
        slug: true,
        city: true,
        state: true,
        phoneWhatsapp: true,
        instagram: true,
        facebook: true,
        website: true,
        themePrimaryColor: true,
        isPublishEnabled: true,
      },
    })
    if (!g || !g.isPublishEnabled)
      throw new NotFoundException('Garagem não publicada')
    return g
  }
}
