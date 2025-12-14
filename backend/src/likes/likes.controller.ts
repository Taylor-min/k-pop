import { Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('me/likes')
@UseGuards(FirebaseAuthGuard)
export class LikesController {
  constructor(
    private readonly likesService: LikesService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getMyLikes(@Req() req: any) {
    await this.usersService.findOrCreateByFirebaseUid(
      req.firebaseUid,
      req.firebaseToken?.name,
      req.firebaseToken?.email,
      req.firebaseToken?.picture,
    );

    return this.likesService.getMyLikes(req.firebaseUid);
  }

  @Post(':stageId/toggle')
  async toggleLike(
    @Req() req: any,
    @Param('stageId', ParseIntPipe) stageId: number,
  ) {
    await this.usersService.findOrCreateByFirebaseUid(
      req.firebaseUid,
      req.firebaseToken?.name,
      req.firebaseToken?.email,
      req.firebaseToken?.picture,
    );

    return this.likesService.toggleLike(req.firebaseUid, stageId);
  }
}