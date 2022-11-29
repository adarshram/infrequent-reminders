import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserNotifications } from './UserNotifications';

@Entity('notification_log')
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  send_type: string;
  @Column()
  user_id: string;

  @Column()
  created_at: Date;
  @Column()
  updated_at: Date;

  @OneToOne((type) => UserNotifications)
  @JoinColumn({ name: 'notification_id', referencedColumnName: 'id' })
  user_notifications: UserNotifications;
}
