import { Module } from '@nestjs/common'
import { GarageUsersController } from './garage-users.controller'
import { GarageUsersService } from './garage-users.service'
@Module({
  controllers: [GarageUsersController],
  providers: [GarageUsersService],
})
export class GarageUsersModule {}
