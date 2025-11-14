import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { VehiclesModule } from './vehicles/vehicles.module'
import { AuthModule } from './auth/auth.module'
import { GarageModule } from './garage/garage.module'
import { GarageUsersModule } from './garage-users/garage-users.module'
import { PublicModule } from './public/public.module'
import { LeadsModule } from './leads/leads.module'

@Module({
  imports: [
    PrismaModule,
    VehiclesModule,
    AuthModule,
    GarageModule,
    GarageUsersModule,
    PublicModule,
    LeadsModule,
  ],
})
export class AppModule {}
