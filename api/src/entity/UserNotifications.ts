import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_notifications')
export class UserNotifications {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  subject: string;

  @Column()
  description: string;

  @Column()
  frequency_type: string;

  @Column()
  frequency: number;

  @Column()
  is_active: boolean;

  @Column()
  notification_date: Date;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
