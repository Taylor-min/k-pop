import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOrCreateByFirebaseUid(firebaseUid: string, profile?: { displayName?: string | null; email?: string | null; photoUrl?: string | null; }, email?: any, picture?: any) {
    let user = await this.userRepo.findOne({ where: { firebaseUid } });
    if (!user) {
      user = this.userRepo.create({
        firebaseUid,
        displayName: profile?.displayName ?? null,
        email: profile?.email ?? null,
        photoUrl: profile?.photoUrl ?? null,
      });
      user = await this.userRepo.save(user);
    }
    return user;
  }
}