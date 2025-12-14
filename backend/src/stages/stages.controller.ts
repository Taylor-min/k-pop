import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StagesService } from './stages.service';

@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Get()
  async getStages() {
    return this.stagesService.findAll();
  }

  @Get(':id')
  async getStage(@Param('id', ParseIntPipe) id: number) {
    const stage = await this.stagesService.findOne(id);
    return stage;
  }
}