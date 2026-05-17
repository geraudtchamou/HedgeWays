import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { EmProductSubType, EmRegion, EmCountry, CommodityType, MiningOperationType, ManufacturingSector, CryptoCategory, HousingType, EsgRating, CurrencyHedging } from '../dto/em-product.dto';

/**
 * Emerging Markets Product Details Entity
 * Extends base product with EM-specific attributes
 */
@Entity('em_product_details')
@Index(['targetRegion', 'baseProductType'])
@Index(['emSubType', 'status'])
@Index(['targetCountries', 'riskLevel'])
export class EmProductDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  /**
   * Base product type (from parent Product entity)
   */
  @Column({
    type: 'enum',
    enum: ['HEDGE_FUND', 'MUTUAL_FUND', 'ETF', 'PRIVATE_EQUITY', 'REAL_ESTATE', 'COMMODITY', 'CRYPTO_FUND', 'ANGEL_SYNDICATE', 'SPV', 'TRUST_FUND', 'STRUCTURED_PRODUCT'],
    nullable: true,
  })
  baseProductType: string;

  /**
   * Specialized EM product sub-type
   */
  @Column({
    type: 'enum',
    enum: EmProductSubType,
    name: 'em_sub_type',
  })
  emSubType: EmProductSubType;

  /**
   * Target geographic region
   */
  @Column({
    type: 'enum',
    enum: EmRegion,
    name: 'target_region',
  })
  targetRegion: EmRegion;

  /**
   * Target countries (array of country codes)
   */
  @Column({
    type: 'simple-array',
    name: 'target_countries',
    nullable: true,
  })
  targetCountries?: EmCountry[];

  // ========== Commodity Exposure Fields ==========
  @Column({
    type: 'enum',
    enum: CommodityType,
    name: 'commodity_type',
    nullable: true,
  })
  commodityType?: CommodityType;

  @Column({ type: 'simple-array', name: 'specific_commodities', nullable: true })
  specificCommodities?: string[];

  @Column({ type: 'boolean', name: 'is_futures_based', default: false })
  isFuturesBased: boolean;

  @Column({ type: 'int', name: 'roll_frequency_days', nullable: true })
  rollFrequencyDays?: number;

  // ========== Equity Exposure Fields ==========
  @Column({
    type: 'enum',
    enum: EmCountry,
    name: 'equity_country',
    nullable: true,
  })
  equityCountry?: EmCountry;

  @Column({ type: 'varchar', length: 100, name: 'equity_sector', nullable: true })
  equitySector?: string;

  @Column({
    type: 'enum',
    enum: ['LARGE', 'MID', 'SMALL', 'MICRO'],
    name: 'market_cap_focus',
    nullable: true,
  })
  marketCapFocus?: 'LARGE' | 'MID' | 'SMALL' | 'MICRO';

  @Column({
    type: 'enum',
    enum: ['VALUE', 'GROWTH', 'BLEND'],
    name: 'investment_style',
    nullable: true,
  })
  investmentStyle?: 'VALUE' | 'GROWTH' | 'BLEND';

  @Column({ type: 'boolean', name: 'dividend_focus', default: false })
  dividendFocus: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'min_dividend_yield', nullable: true })
  minDividendYield?: number;

  // ========== Bond Exposure Fields ==========
  @Column({
    type: 'enum',
    enum: ['SOVEREIGN', 'CORPORATE', 'QUASI_SOVEREIGN', 'MUNICIPAL'],
    name: 'bond_type',
    nullable: true,
  })
  bondType?: 'SOVEREIGN' | 'CORPORATE' | 'QUASI_SOVEREIGN' | 'MUNICIPAL';

  @Column({
    type: 'enum',
    enum: EmCountry,
    name: 'bond_country',
    nullable: true,
  })
  bondCountry?: EmCountry;

  @Column({ type: 'varchar', length: 10, name: 'bond_currency', nullable: true })
  bondCurrency?: string;

  @Column({
    type: 'enum',
    enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'DEFAULT'],
    name: 'credit_rating',
    nullable: true,
  })
  creditRating?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'avg_duration', nullable: true })
  avgDuration?: number; // Years

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'avg_yield', nullable: true })
  avgYield?: number; // Percentage

  // ========== Real Estate/Housing Exposure Fields ==========
  @Column({
    type: 'enum',
    enum: HousingType,
    name: 'housing_type',
    nullable: true,
  })
  housingType?: HousingType;

  @Column({
    type: 'enum',
    enum: ['RETAIL', 'OFFICE', 'INDUSTRIAL', 'RESIDENTIAL', 'HOSPITALITY'],
    name: 'property_type',
    nullable: true,
  })
  propertyType?: 'RETAIL' | 'OFFICE' | 'INDUSTRIAL' | 'RESIDENTIAL' | 'HOSPITALITY';

  @Column({
    type: 'enum',
    enum: EmCountry,
    name: 'property_country',
    nullable: true,
  })
  propertyCountry?: EmCountry;

  @Column({ type: 'varchar', length: 100, name: 'property_city', nullable: true })
  propertyCity?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'target_occupancy_rate', nullable: true })
  targetOccupancyRate?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'projected_rental_yield', nullable: true })
  projectedRentalYield?: number;

  @Column({ type: 'boolean', name: 'is_development_project', default: false })
  isDevelopmentProject: boolean;

  @Column({ type: 'int', name: 'development_timeline_months', nullable: true })
  developmentTimelineMonths?: number;

  // ========== Manufacturing Exposure Fields ==========
  @Column({
    type: 'enum',
    enum: ManufacturingSector,
    name: 'manufacturing_sector',
    nullable: true,
  })
  manufacturingSector?: ManufacturingSector;

  @Column({
    type: 'enum',
    enum: EmCountry,
    name: 'manufacturing_country',
    nullable: true,
  })
  manufacturingCountry?: EmCountry;

  @Column({ type: 'varchar', length: 100, name: 'manufacturing_subsector', nullable: true })
  manufacturingSubsector?: string;

  @Column({ type: 'bigint', name: 'production_capacity', nullable: true })
  productionCapacity?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'capacity_utilization', nullable: true })
  capacityUtilization?: number;

  @Column({ type: 'boolean', name: 'is_export_oriented', default: false })
  isExportOriented: boolean;

  @Column({ type: 'text', name: 'export_markets', nullable: true })
  exportMarkets?: string;

  // ========== Mining Exposure Fields ==========
  @Column({
    type: 'enum',
    enum: MiningOperationType,
    name: 'mining_operation_type',
    nullable: true,
  })
  miningOperationType?: MiningOperationType;

  @Column({
    type: 'enum',
    enum: CommodityType,
    name: 'mining_resource_type',
    nullable: true,
  })
  miningResourceType?: CommodityType;

  @Column({ type: 'simple-array', name: 'specific_resources', nullable: true })
  specificResources?: string[];

  @Column({
    type: 'enum',
    enum: EmCountry,
    name: 'mining_country',
    nullable: true,
  })
  miningCountry?: EmCountry;

  @Column({ type: 'int', name: 'reserve_life_years', nullable: true })
  reserveLifeYears?: number;

  @Column({ type: 'bigint', name: 'daily_production', nullable: true })
  dailyProduction?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'all_in_sustaining_cost', nullable: true })
  allInSustainingCost?: number;

  @Column({ type: 'boolean', name: 'has_environmental_permits', default: false })
  hasEnvironmentalPermits: boolean;

  // ========== Crypto Exposure Fields ==========
  @Column({
    type: 'enum',
    enum: CryptoCategory,
    name: 'crypto_category',
    nullable: true,
  })
  cryptoCategory?: CryptoCategory;

  @Column({ type: 'simple-array', name: 'crypto_specific_assets', nullable: true })
  cryptoSpecificAssets?: string[];

  @Column({ type: 'boolean', name: 'is_staking_enabled', default: false })
  isStakingEnabled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'staking_yield', nullable: true })
  stakingYield?: number;

  @Column({ type: 'boolean', name: 'is_custodied', default: false })
  isCustodied: boolean;

  @Column({ type: 'varchar', length: 200, name: 'custodian', nullable: true })
  custodian?: string;

  @Column({ type: 'boolean', name: 'crypto_uses_derivatives', default: false })
  cryptoUsesDerivatives: boolean;

  // ========== Asset Allocation Fields ==========
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'commodities_allocation', nullable: true })
  commoditiesAllocation?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'equities_allocation', nullable: true })
  equitiesAllocation?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'bonds_allocation', nullable: true })
  bondsAllocation?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'real_estate_allocation', nullable: true })
  realEstateAllocation?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'manufacturing_allocation', nullable: true })
  manufacturingAllocation?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'mining_allocation', nullable: true })
  miningAllocation?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'crypto_allocation', nullable: true })
  cryptoAllocation?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'cash_allocation', nullable: true })
  cashAllocation?: number;

  // ========== ESG & Compliance Fields ==========
  @Column({
    type: 'enum',
    enum: EsgRating,
    name: 'esg_rating',
    nullable: true,
  })
  esgRating?: EsgRating;

  @Column({ type: 'boolean', name: 'is_sharia_compliant', default: false })
  isShariaCompliant: boolean;

  @Column({ type: 'boolean', name: 'has_impact_investing_focus', default: false })
  hasImpactInvestingFocus: boolean;

  // ========== Risk Management Fields ==========
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'max_single_asset_exposure', nullable: true })
  maxSingleAssetExposure?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'max_country_exposure', nullable: true })
  maxCountryExposure?: number;

  @Column({
    type: 'enum',
    enum: CurrencyHedging,
    name: 'currency_hedging_strategy',
    nullable: true,
  })
  currencyHedgingStrategy?: CurrencyHedging;

  @Column({ type: 'boolean', name: 'uses_currency_hedging', default: false })
  usesCurrencyHedging: boolean;

  @Column({ type: 'boolean', name: 'uses_derivatives', default: false })
  usesDerivatives: boolean;

  // ========== Benchmark & Metadata Fields ==========
  @Column({ type: 'simple-array', name: 'benchmark_indices', nullable: true })
  benchmarkIndices?: string[];

  @Column({ type: 'timestamptz', name: 'inception_date', nullable: true })
  inceptionDate?: Date;

  @Column({ type: 'varchar', length: 20, name: 'fiscal_year_end', nullable: true })
  fiscalYearEnd?: string; // e.g., "12-31"

  @Column({ type: 'simple-array', name: 'document_urls', nullable: true })
  documentUrls?: string[];

  /**
   * Current status of the EM product
   */
  @Column({
    type: 'enum',
    enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'LIQUIDATED'],
    default: 'DRAFT',
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
