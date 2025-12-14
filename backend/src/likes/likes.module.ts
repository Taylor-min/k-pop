import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLike } from './user-like.entity';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { User } from '../users/user.entity';
import { Stage } from '../stages/stage.entity';
import { UsersModule } from '../users/users.module';
import { StagesModule } from '../stages/stages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLike, User, Stage]),
    UsersModule,
    StagesModule,
  ],
  providers: [LikesService],
  controllers: [LikesController],
})
export class LikesModule {}