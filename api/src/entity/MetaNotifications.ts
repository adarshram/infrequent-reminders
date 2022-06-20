import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('meta_notifications')
export class MetaNotifications {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  notification_id: number;

  @Column()
  cron_snoozed: number;

  @Column()
  user_snoozed: number;

  @Column()
  updated_at: Date;
}
