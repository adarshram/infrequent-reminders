import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification_set')
export class NotificationSet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @Column()
  description: string;

  @Column()
  user_id: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
