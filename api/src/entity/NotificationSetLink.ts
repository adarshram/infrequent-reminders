import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('notification_set_link')
export class NotificationSetLink {
  @PrimaryColumn()
  user_notification_id: number;

  @PrimaryColumn()
  set_id: number;

  @Column()
  order: number;

  @Column()
  days_after: number;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
