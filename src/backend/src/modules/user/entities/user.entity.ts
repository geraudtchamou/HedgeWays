import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { UserRole, UserStatus, KycStatus, AccreditationStatus } from './user.dto';
import { Profile } from '../profile/profile.entity';
import { KycApplication } from '../../kyc/entities/kyc-application.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { AuditLog } from '../../admin/entities/audit-log.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['status', 'kycStatus'])
@Index(['role', 'status'])
@Index(['createdAt'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  countryOfResidence: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  // Corporate fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  authorizedFirstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  authorizedLastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  authorizedTitle: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.INDIVIDUAL_INVESTOR })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.NOT_STARTED })
  kycStatus: KycStatus;

  @Column({ type: 'enum', enum: AccreditationStatus, default: AccreditationStatus.NOT_VERIFIED })
  accreditationStatus: AccreditationStatus;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mfaSecret: string;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string;

  @Column({ type: 'integer', default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil: Date;

  @Column({ type: 'uuid', nullable: true })
  referredBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referralCode: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  // Relations
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: Profile;

  @OneToOne(() => KycApplication, (kyc) => kyc.user, { cascade: true })
  @JoinColumn()
  kycApplication: KycApplication;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Subscription, (subscription) => subscription.investor)
  subscriptions: Subscription[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];
}
