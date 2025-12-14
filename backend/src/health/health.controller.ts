import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  async check() {
    const result: { db: 'up' | 'down' } = { db: 'down' };

    try {
      // 간단하게 DB ping
      await this.dataSource.query('SELECT 1');
      result.db = 'up';
    } catch (e) {
      result.db = 'down';
    }

    return {
      status: result.db === 'up' ? 'ok' : 'degraded',
      db: result.db,
      timestamp: new Date().toISOString(),
    };
  }
}