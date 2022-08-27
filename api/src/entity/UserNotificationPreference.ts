import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserProfile } from './UserProfile';

@Entity('user_notification_preference')
export class UserNotificationPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  vapidkeys: string;

  @Column()
  email: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
