import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

@Entity('nav_history')
@Index(['productId', 'valuationDate'])
@Index(['valuationDate'])
export class NavHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  navPerShare: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalAum: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  totalShares: number;

  @Column({ type: 'date' })
  valuationDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  previousNav: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  dailyReturn: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  mtdReturn: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  qtdReturn: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  ytdReturn: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  sinceInceptionReturn: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Product, (product) => product.navHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;
}

// Note: Product entity is imported via circular reference resolution in TypeORM
