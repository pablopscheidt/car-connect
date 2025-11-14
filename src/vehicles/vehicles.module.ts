import { Module } from '@nestjs/common'
import { VehiclesController } from './vehicles.controller'
import { VehiclesService } from './vehicles.service'
import { MulterModule } from '@nestjs/platform-express'

@Module({
  imports: [
    MulterModule.register({
      dest: process.env.UPLOAD_DIR || './uploads',
    }),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
