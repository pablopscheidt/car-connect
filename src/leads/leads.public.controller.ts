import { Body, Controller, Param, Post } from '@nestjs/common'
import { LeadsService } from './leads.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Public Leads')
@Controller('v1/public/:garageSlug/leads')
export class LeadsPublicController {
  constructor(private readonly service: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar interesse em um veículo (público)' })
  create(@Param('garageSlug') garageSlug: string, @Body() dto: CreateLeadDto) {
    return this.service.createPublic(garageSlug, dto)
  }
}
