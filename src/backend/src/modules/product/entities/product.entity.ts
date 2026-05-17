import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';
import { Decimal } from 'decimal.js';
import { ProductType, ProductStatus, RiskLevel, RedemptionFrequency } from '../dto/product.dto';
import { User } from '../../user/entities/user.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { NavHistory } from './nav-history.entity';

@Entity('products')
@Index(['type', 'status'])
@Index(['riskLevel'])
@Index(['currency'])
@Index(['createdAt'])
@Unique(['name']) // Product names must be unique
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProductType })
  type: ProductType;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minimumInvestment: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  maximumInvestment: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  targetAum: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  currentAum: number;

  @Column({ type: 'enum', enum: RiskLevel })
  riskLevel: RiskLevel;

  @Column({ type: 'jsonb', default: [] })
  feeStructures: Array<{
    type: string;
    percentage: number;
    minimumAmount?: number;
    maximumAmount?: number;
    isHighWaterMark?: boolean;
    hurdleRate?: number;
  }>;

  @Column({ type: 'enum', enum: RedemptionFrequency })
  redemptionFrequency: RedemptionFrequency;

  @Column({ type: 'integer', nullable: true })
  lockupPeriodDays: number;

  @Column({ type: 'integer', nullable: true })
  noticePeriodDays: number;

  @Column({ type: 'boolean', default: false })
  isAccreditedOnly: boolean;

  @Column({ type: 'text', nullable: true })
  investmentStrategy: string;

  @Column({ type: 'uuid', nullable: true })
  fundManagerId: string;

  @Column({ type: 'jsonb', default: [] })
  allowedCountries: string[];

  @Column({ type: 'jsonb', default: [] })
  restrictedCountries: string[];

  @Column({ type: 'date', nullable: true })
  inceptionDate: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  fiscalYearEnd: string; // Format: "MM-DD"

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  navPerShare: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalShares: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  highWaterMark: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastNavDate: Date;

  @Column({ type: 'integer', default: 0 })
  totalInvestors: number;

  @Column({ type: 'integer', default: 0 })
  activeSubscriptions: number;

  @Column({ type: 'jsonb', default: {} })
  performanceMetrics: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  offeringDocumentUrl: string;

  @Column({ type: 'text', nullable: true })
  termSheetUrl: string;

  @Column({ type: 'text', nullable: true })
  factsheetUrl: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.id, { eager: false })
  @JoinColumn({ name: 'fundManagerId' })
  fundManager: User;

  @OneToMany(() => Subscription, (subscription) => subscription.product)
  subscriptions: Subscription[];

  @OneToMany(() => NavHistory, (navHistory) => navHistory.product)
  navHistory: NavHistory[];
}
