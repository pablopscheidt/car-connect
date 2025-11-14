import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { ListGarageUsersQueryDto } from './dto/list-query.dto'
import { CreateGarageUserDto } from './dto/create-garage-user.dto'
import { UpdateGarageUserDto } from './dto/update-garage-user.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class GarageUsersService {
  constructor(private prisma: PrismaService) {}

  async list(garageId: string, q: ListGarageUsersQueryDto) {
    const page = q.page ?? 1
    const pageSize = Math.min(q.pageSize ?? 20, 100)

    const where: Prisma.GarageUserWhereInput = {
      garageId,
      user: q.q
        ? {
            OR: [
              { name: { contains: q.q, mode: 'insensitive' } },
              { email: { contains: q.q, mode: 'insensitive' } },
            ],
          }
        : undefined,
    }

    const [items, total] = await Promise.all([
      this.prisma.garageUser.findMany({
        where,
        select: {
          userId: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              lastLoginAt: true,
              createdAt: true,
            },
          },
        },
        orderBy: [{ role: 'asc' }, { user: { name: 'asc' } }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.garageUser.count({ where }),
    ])

    return { items, page, pageSize, total }
  }

  async create(garageId: string, actorId: string, dto: CreateGarageUserDto) {
    // email único global
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) {
      const passwordHash = dto.password
        ? await bcrypt.hash(dto.password, 10)
        : await bcrypt.hash('changeme123', 10)
      user = await this.prisma.user.create({
        data: { email: dto.email, name: dto.name, passwordHash },
      })
    }

    const exists = await this.prisma.garageUser.findUnique({
      where: { garageId_userId: { garageId, userId: user.id } },
    })
    if (exists)
      throw new BadRequestException('Usuário já vinculado a esta garagem')

    await this.prisma.garageUser.create({
      data: { garageId, userId: user.id, role: dto.role },
    })

    await this.prisma.auditLog.create({
      data: {
        garageId,
        userId: actorId,
        entity: 'GARAGE',
        entityId: garageId,
        action: 'UPDATE',
        changes: { addUser: { userId: user.id, role: dto.role } },
      },
    })

    return { ok: true, userId: user.id }
  }

  async update(
    garageId: string,
    actorId: string,
    targetUserId: string,
    dto: UpdateGarageUserDto,
  ) {
    const link = await this.prisma.garageUser.findUnique({
      where: { garageId_userId: { garageId, userId: targetUserId } },
      select: {
        role: true,
        user: { select: { id: true, name: true, passwordHash: true } },
      },
    })
    if (!link) throw new NotFoundException('Usuário não vinculado à garagem')

    if (dto.role && link.role === 'OWNER' && dto.role !== 'OWNER') {
      const owners = await this.prisma.garageUser.count({
        where: { garageId, role: 'OWNER' },
      })
      if (owners <= 1)
        throw new ForbiddenException(
          'Não é permitido rebaixar o último OWNER da garagem',
        )
    }

    if (
      actorId === targetUserId &&
      dto.role &&
      dto.role !== 'OWNER' &&
      link.role === 'OWNER'
    ) {
      const owners = await this.prisma.garageUser.count({
        where: { garageId, role: 'OWNER' },
      })
      if (owners <= 1)
        throw new ForbiddenException(
          'Não é permitido rebaixar seu próprio papel se for o último OWNER da garagem',
        )
    }

    const dataUser: Prisma.UserUpdateInput = {}
    if (dto.name) dataUser.name = dto.name
    if (dto.password)
      dataUser.passwordHash = await bcrypt.hash(dto.password, 10)

    const tx: any[] = []
    if (Object.keys(dataUser).length) {
      tx.push(
        this.prisma.user.update({
          where: { id: targetUserId },
          data: dataUser,
        }),
      )
    }
    if (dto.role) {
      tx.push(
        this.prisma.garageUser.update({
          where: { garageId_userId: { garageId, userId: targetUserId } },
          data: { role: dto.role },
        }),
      )
    }

    if (!tx.length) return { ok: true }

    await this.prisma.$transaction(tx)

    await this.prisma.auditLog.create({
      data: {
        garageId,
        userId: actorId,
        entity: 'GARAGE',
        entityId: garageId,
        action: 'UPDATE',
        changes: { updateUser: { userId: targetUserId, ...dto } },
      },
    })

    return { ok: true }
  }

  async remove(garageId: string, actorId: string, targetUserId: string) {
    const link = await this.prisma.garageUser.findUnique({
      where: { garageId_userId: { garageId, userId: targetUserId } },
      select: { role: true },
    })
    if (!link) throw new NotFoundException('Usuário não vinculado à garagem')

    if (link.role === 'OWNER') {
      const owners = await this.prisma.garageUser.count({
        where: { garageId, role: 'OWNER' },
      })
      if (owners <= 1)
        throw new ForbiddenException(
          'Não é permitido remover o último OWNER da garagem',
        )
    }

    await this.prisma.garageUser.delete({
      where: { garageId_userId: { garageId, userId: targetUserId } },
    })

    await this.prisma.auditLog.create({
      data: {
        garageId,
        userId: actorId,
        entity: 'GARAGE',
        entityId: garageId,
        action: 'UPDATE',
        changes: { removeUser: { userId: targetUserId } },
      },
    })

    return { ok: true }
  }
}
