import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'firebase_uid', length: 128, unique: true })
  firebaseUid: string;

  @Column({ name: 'display_name', length: 100, nullable: true, type: 'varchar' })
  displayName: string | null;

  @Column({ name: 'email', length: 255, nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ name: 'photo_url', length: 255, nullable: true, type: 'varchar' })
  photoUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}