import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserNotifications } from './UserNotifications';

@Entity('meta_notifications')
export class MetaNotifications {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  cron_snoozed: number;

  @Column()
  user_snoozed: number;

  @Column()
  done_count: number;

  @Column()
  updated_at: Date;

  @OneToOne((type) => UserNotifications)
  @JoinColumn({ name: 'notification_id', referencedColumnName: 'id' })
  user_notifications: UserNotifications;
}
