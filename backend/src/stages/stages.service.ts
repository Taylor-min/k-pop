import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stage } from './stage.entity';

@Injectable()
export class StagesService {
  constructor(
    @InjectRepository(Stage)
    private readonly stageRepo: Repository<Stage>,
  ) {}

  findAll() {
    return this.stageRepo.find({
      where: { isActive: 1 },
      order: { id: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.stageRepo.findOne({ where: { id, isActive: 1 } });
  }
}