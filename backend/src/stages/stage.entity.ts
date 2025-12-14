import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('stages')
export class Stage {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 100 })
  artist: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 10 })
  generation: '2세대' | '3세대' | '4세대' | '5세대';

  @Column({ length: 10 })
  mood: '신남' | '감성' | '파워풀' | '치유';

  @Column({ length: 10 })
  gender: '남성' | '여성' | '혼성';

  @Column({ name: 'youtube_id', length: 64 })
  youtubeId: string;

  @Column({ type: 'json', nullable: true })
  tagsJson: string[] | null;

  @Column({ name: 'is_active', type: 'tinyint', unsigned: true, default: 1 })
  isActive: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}