import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stage } from './stages/stage.entity';
import { User } from './users/user.entity';
import { UserLike } from './likes/user-like.entity';
import { StagesModule } from './stages/stages.module';
import { LikesModule } from './likes/likes.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './health/health.module';

@Module({
     imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'kpop'),
        password: config.get<string>('DB_PASS', '1234'),
        database: config.get<string>('DB_NAME', 'kpop_app'),
        entities: [Stage, User, UserLike],
        synchronize: true,
      }),
    }),
    StagesModule,
    LikesModule,
    UsersModule,
    HealthModule,
    ],
})
export class AppModule {}