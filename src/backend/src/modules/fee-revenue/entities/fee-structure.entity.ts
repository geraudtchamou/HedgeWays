import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { FeeCategory, FeeCalculationMethod, AccrualFrequency } from '../dto/fee-revenue.dto';

@Entity('fee_structures')
@Index(['productId', 'category'])
@Index(['productId', 'isActive'])
@Index(['category'])
export class FeeStructure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @ManyToOne(() => Product, (product) => product.id, { eager: false })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'enum', enum: FeeCategory })
  category: FeeCategory;

  @Column({ type: 'enum', enum: FeeCalculationMethod })
  calculationMethod: FeeCalculationMethod;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  percentage: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  flatAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  minimumAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  maximumAmount: number;

  @Column({ type: 'jsonb', nullable: true })
  tieredFees: Array<{
    threshold: number;
    percentage: number;
  }>;

  @Column({ type: 'boolean', default: false })
  isHighWaterMark: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  hurdleRate: number;

  @Column({ type: 'enum', enum: AccrualFrequency })
  accrualFrequency: AccrualFrequency;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveFrom: Date;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveTo: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  // Relations
  @OneToMany(() => FeeAccrual, (accrual) => accrual.feeStructure)
  feeAccruals: FeeAccrual[];
}

@Entity('fee_accruals')
@Index(['feeStructureId'])
@Index(['productId'])
@Index(['investorId'])
@Index(['status'])
@Index(['accrualDate'])
@Index(['dueDate'])
export class FeeAccrual {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  feeStructureId: string;

  @ManyToOne(() => FeeStructure, (feeStructure) => feeStructure.id, { eager: false })
  @JoinColumn({ name: 'feeStructureId' })
  feeStructure: FeeStructure;

  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  investorId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  accruedAmount: number;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'timestamptz' })
  accrualDate: Date;

  @Column({ type: 'timestamptz' })
  dueDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  baseAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  appliedRate: number;

  @Column({ type: 'jsonb', nullable: true })
  calculationDetails: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('fee_payments')
@Index(['accrualId'])
@Index(['productId'])
@Index(['status'])
@Index(['paymentDate'])
export class FeePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accrualId: string;

  @ManyToOne(() => FeeAccrual, (accrual) => accrual.id, { eager: false })
  @JoinColumn({ name: 'accrualId' })
  accrual: FeeAccrual;

  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  investorId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  paymentDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('revenue_recognitions')
@Index(['productId'])
@Index(['revenueType'])
@Index(['recognitionDate'])
@Index(['sourceId'])
export class RevenueRecognition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @Column({ type: 'varchar', length: 50 })
  revenueType: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'timestamptz' })
  recognitionDate: Date;

  @Column({ type: 'uuid', nullable: true })
  sourceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isReconciled: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  reconciledAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
