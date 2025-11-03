import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { VehiclesModule } from './vehicles/vehicles.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [PrismaModule, VehiclesModule, AuthModule],
})
export class AppModule {}
