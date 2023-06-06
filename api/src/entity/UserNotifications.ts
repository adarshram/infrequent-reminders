import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { MetaNotifications } from './MetaNotifications';
import { UserProfile } from './UserProfile';
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

  meta: MetaNotifications;

  link: any;

  @OneToOne(() => MetaNotifications, (notification) => notification.user_notifications, {
    cascade: true,
  })
  meta_notifications: MetaNotifications;

  @OneToOne(() => UserProfile, (profile) => profile.user_notifications, {
    cascade: true,
  })
  user_profile: UserProfile;
}
