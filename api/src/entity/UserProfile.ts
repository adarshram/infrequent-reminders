import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserNotifications } from './UserNotifications';

@Entity('user_profile')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fireBaseRefId: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @OneToOne((type) => UserNotifications)
  @JoinColumn({ name: 'fireBaseRefId', referencedColumnName: 'user_id' })
  user_notifications: UserNotifications;
}
