import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
