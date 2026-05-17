import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AdminAction, EntityType } from '../dto/admin.dto';

@Entity('audit_logs')
@Index(['userId'])
@Index(['entityType', 'entityId'])
@Index(['action'])
@Index(['createdAt'])
@Index(['ipAddress'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  userName: string;

  @Column({ type: 'varchar', length: 100 })
  userRole: string;

  @Column({ type: 'enum', enum: AdminAction })
  action: AdminAction;

  @Column({ type: 'enum', enum: EntityType })
  entityType: EntityType;

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityName: string;

  @Column({ type: 'jsonb', default: {} })
  changes: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
