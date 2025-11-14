import { Module } from '@nestjs/common'
import { LeadsService } from './leads.service'
import { LeadsController } from './leads.controller'
import { LeadsPublicController } from './leads.public.controller'

@Module({
  controllers: [LeadsController, LeadsPublicController],
  providers: [LeadsService],
})
export class LeadsModule {}
