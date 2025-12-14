import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLike } from './user-like.entity';
import { UsersService } from '../users/users.service';
import { Stage } from '../stages/stage.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(UserLike)
    private readonly likeRepo: Repository<UserLike>,
    @InjectRepository(Stage)
    private readonly stageRepo: Repository<Stage>,
    private readonly usersService: UsersService,
  ) {}

  async getMyLikes(firebaseUid: string) {
    const user = await this.usersService.findOrCreateByFirebaseUid(firebaseUid);
    const likes = await this.likeRepo.find({
      where: { user: { id: user.id } },
      relations: ['stage'],
      order: { createdAt: 'DESC' },
    });
    return likes.map((l) => l.stage);
  }

  async toggleLike(firebaseUid: string, stageId: number) {
    const user = await this.usersService.findOrCreateByFirebaseUid(firebaseUid);
    const stage = await this.stageRepo.findOne({ where: { id: stageId } });
    if (!stage) throw new NotFoundException('Stage not found');

    const existing = await this.likeRepo.findOne({
      where: { user: { id: user.id }, stage: { id: stage.id } },
      relations: ['user', 'stage'],
    });

    if (existing) {
      await this.likeRepo.remove(existing);
      return { liked: false };
    }

    const like = this.likeRepo.create({ user, stage });
    await this.likeRepo.save(like);
    return { liked: true };
  }
}