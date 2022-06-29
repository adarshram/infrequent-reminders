import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('system_credentials')
export class SystemCredentials {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  settings_key: string;

  @Column()
  settings_value: string;

  @Column('jsonb', { nullable: true, default: {} })
  settings_json_value?: string;
}
