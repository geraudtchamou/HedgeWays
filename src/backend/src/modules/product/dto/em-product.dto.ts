import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean, Min, Max, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, RiskLevel, RedemptionFrequency, FeeStructureDto } from '../dto/product.dto';

/**
 * Emerging Markets Specialized Product Types
 */
export enum EmProductSubType {
  // Commodity-based products
  COMMODITY_INDEX = 'COMMODITY_INDEX',
  COMMODITY_FUTURES = 'COMMODITY_FUTURES',
  COMMODITY_SPOT = 'COMMODITY_SPOT',
  
  // Stock-based products
  EM_EQUITY_BROAD = 'EM_EQUITY_BROAD',
  EM_EQUITY_COUNTRY = 'EM_EQUITY_COUNTRY',
  EM_EQUITY_SECTOR = 'EM_EQUITY_SECTOR',
  EM_EQUITY_DIVIDEND = 'EM_EQUITY_DIVIDEND',
  EM_EQUITY_SMALL_CAP = 'EM_EQUITY_SMALL_CAP',
  
  // Bond-based products
  EM_BOND_SOVEREIGN_HARD = 'EM_BOND_SOVEREIGN_HARD',
  EM_BOND_SOVEREIGN_LOCAL = 'EM_BOND_SOVEREIGN_LOCAL',
  EM_BOND_CORPORATE = 'EM_BOND_CORPORATE',
  EM_BOND_HIGH_YIELD = 'EM_BOND_HIGH_YIELD',
  EM_BOND_INVESTMENT_GRADE = 'EM_BOND_INVESTMENT_GRADE',
  
  // Housing/Real Estate products
  EM_REIT_RESIDENTIAL = 'EM_REIT_RESIDENTIAL',
  EM_REIT_COMMERCIAL = 'EM_REIT_COMMERCIAL',
  EM_REIT_INDUSTRIAL = 'EM_REIT_INDUSTRIAL',
  EM_HOUSING_DEVELOPMENT = 'EM_HOUSING_DEVELOPMENT',
  EM_AFFORDABLE_HOUSING = 'EM_AFFORDABLE_HOUSING',
  
  // Manufacturing products
  EM_MANUFACTURING_INFRASTRUCTURE = 'EM_MANUFACTURING_INFRASTRUCTURE',
  EM_MANUFACTURING_INDUSTRIAL = 'EM_MANUFACTURING_INDUSTRIAL',
  EM_MANUFACTURING_TECH = 'EM_MANUFACTURING_TECH',
  EM_MANUFACTURING_CONSUMER = 'EM_MANUFACTURING_CONSUMER',
  
  // Mining products
  EM_MINING_PRECIOUS_METALS = 'EM_MINING_PRECIOUS_METALS',
  EM_MINING_BASE_METALS = 'EM_MINING_BASE_METALS',
  EM_MINING_ENERGY = 'EM_MINING_ENERGY',
  EM_MINING_RARE_EARTH = 'EM_MINING_RARE_EARTH',
  EM_MINING_DIVERSIFIED = 'EM_MINING_DIVERSIFIED',
  
  // Crypto products
  EM_CRYPTO_BITCOIN = 'EM_CRYPTO_BITCOIN',
  EM_CRYPTO_ETHER = 'EM_CRYPTO_ETHER',
  EM_CRYPTO_ALTS = 'EM_CRYPTO_ALTS',
  EM_CRYPTO_STAKING = 'EM_CRYPTO_STAKING',
  EM_CRYPTO_DEFi = 'EM_CRYPTO_DEFI',
  EM_CRYPTO_INDEX = 'EM_CRYPTO_INDEX',
}

/**
 * Geographic regions for emerging markets
 */
export enum EmRegion {
  ASIA_PACIFIC = 'ASIA_PACIFIC',
  LATIN_AMERICA = 'LATIN_AMERICA',
  EMEA = 'EMEA', // Europe, Middle East, Africa
  EASTERN_EUROPE = 'EASTERN_EUROPE',
  FRONTIER_MARKETS = 'FRONTIER_MARKETS',
  GLOBAL_EM = 'GLOBAL_EM',
}

/**
 * Specific emerging market countries
 */
export enum EmCountry {
  CHINA = 'CHINA',
  INDIA = 'INDIA',
  BRAZIL = 'BRAZIL',
  SOUTH_AFRICA = 'SOUTH_AFRICA',
  MEXICO = 'MEXICO',
  INDONESIA = 'INDONESIA',
  TURKEY = 'TURKEY',
  RUSSIA = 'RUSSIA',
  SAUDI_ARABIA = 'SAUDI_ARABIA',
  ARGENTINA = 'ARGENTINA',
  THAILAND = 'THAILAND',
  MALAYSIA = 'MALAYSIA',
  PHILIPPINES = 'PHILIPPINES',
  VIETNAM = 'VIETNAM',
  EGYPT = 'EGYPT',
  NIGERIA = 'NIGERIA',
  KENYA = 'KENYA',
  CHILE = 'CHILE',
  COLOMBIA = 'COLOMBIA',
  PERU = 'PERU',
  POLAND = 'POLAND',
  CZECH_REPUBLIC = 'CZECH_REPUBLIC',
  HUNGARY = 'HUNGARY',
  UAE = 'UAE',
  QATAR = 'QATAR',
  KUWAIT = 'KUWAIT',
}

/**
 * Commodity types for commodity-backed products
 */
export enum CommodityType {
  ENERGY = 'ENERGY', // Oil, gas, coal
  PRECIOUS_METALS = 'PRECIOUS_METALS', // Gold, silver, platinum
  BASE_METALS = 'BASE_METALS', // Copper, aluminum, zinc
  AGRICULTURAL = 'AGRICULTURAL', // Wheat, corn, soybeans
  LIVESTOCK = 'LIVESTOCK',
  SOFT_COMMODITIES = 'SOFT_COMMODITIES', // Coffee, sugar, cotton
}

/**
 * Mining operation types
 */
export enum MiningOperationType {
  EXPLORATION = 'EXPLORATION',
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
  REFINING = 'REFINING',
  DIVERSIFIED = 'DIVERSIFIED',
}

/**
 * Manufacturing sector types
 */
export enum ManufacturingSector {
  AUTOMOTIVE = 'AUTOMOTIVE',
  ELECTRONICS = 'ELECTRONICS',
  TEXTILES = 'TEXTILES',
  CHEMICALS = 'CHEMICALS',
  MACHINERY = 'MACHINERY',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  PHARMACEUTICALS = 'PHARMACEUTICALS',
  STEEL_METALS = 'STEEL_METALS',
  CONSUMER_GOODS = 'CONSUMER_GOODS',
}

/**
 * Crypto asset categories
 */
export enum CryptoCategory {
  LAYER_1 = 'LAYER_1',
  LAYER_2 = 'LAYER_2',
  DEFI = 'DEFI',
  NFT = 'NFT',
  STABLECOIN = 'STABLECOIN',
  UTILITY_TOKEN = 'UTILITY_TOKEN',
  GOVERNANCE_TOKEN = 'GOVERNANCE_TOKEN',
  PRIVACY_COIN = 'PRIVACY_COIN',
}

/**
 * Housing type classifications
 */
export enum HousingType {
  RESIDENTIAL_APARTMENTS = 'RESIDENTIAL_APARTMENTS',
  SINGLE_FAMILY = 'SINGLE_FAMILY',
  AFFORDABLE_HOUSING = 'AFFORDABLE_HOUSING',
  STUDENT_HOUSING = 'STUDENT_HOUSING',
  SENIOR_LIVING = 'SENIOR_LIVING',
  MIXED_USE = 'MIXED_USE',
}

/**
 * ESG (Environmental, Social, Governance) rating for sustainable investing
 */
export enum EsgRating {
  AAA = 'AAA',
  AA = 'AA',
  A = 'A',
  BBB = 'BBB',
  BB = 'BB',
  B = 'B',
  CCC = 'CCC',
  NOT_RATED = 'NOT_RATED',
}

/**
 * Currency hedging strategy
 */
export enum CurrencyHedging {
  UNHEDGED = 'UNHEDGED',
  FULLY_HEDGED = 'FULLY_HEDGED',
  PARTIALLY_HEDGED = 'PARTIALLY_HEDGED',
  DYNAMIC_HEDGING = 'DYNAMIC_HEDGING',
}

/**
 * Commodity exposure configuration
 */
export class CommodityExposureDto {
  @IsEnum(CommodityType)
  @IsNotEmpty()
  commodityType: CommodityType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specificCommodities?: string[]; // e.g., ['WTI_CRUDE', 'GOLD', 'COPPER']

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetWeight?: number; // Percentage allocation

  @IsEnum(CurrencyHedging)
  @IsOptional()
  currencyHedging?: CurrencyHedging;

  @IsBoolean()
  @IsOptional()
  isFuturesBased?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rollFrequencyDays?: number;
}

/**
 * Equity exposure configuration
 */
export class EquityExposureDto {
  @IsEnum(EmCountry)
  @IsOptional()
  country?: EmCountry;

  @IsEnum(EmRegion)
  @IsOptional()
  region?: EmRegion;

  @IsString()
  @IsOptional()
  sector?: string;

  @IsString()
  @IsOptional()
  marketCapFocus?: 'LARGE' | 'MID' | 'SMALL' | 'MICRO';

  @IsString()
  @IsOptional()
  style?: 'VALUE' | 'GROWTH' | 'BLEND';

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetWeight?: number;

  @IsBoolean()
  @IsOptional()
  dividendFocus?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minDividendYield?: number;
}

/**
 * Bond exposure configuration
 */
export class BondExposureDto {
  @IsString()
  @IsNotEmpty()
  bondType: 'SOVEREIGN' | 'CORPORATE' | 'QUASI_SOVEREIGN' | 'MUNICIPAL';

  @IsEnum(EmCountry)
  @IsOptional()
  country?: EmCountry;

  @IsString()
  @IsOptional()
  currency?: string; // 'USD', 'EUR', 'LOCAL'

  @IsString()
  @IsOptional()
  creditRating?: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'DEFAULT';

  @IsNumber()
  @Min(0)
  @IsOptional()
  avgDuration?: number; // Years

  @IsNumber()
  @Min(0)
  @IsOptional()
  avgYield?: number; // Percentage

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetWeight?: number;
}

/**
 * Real estate/housing exposure configuration
 */
export class RealEstateExposureDto {
  @IsEnum(HousingType)
  @IsOptional()
  housingType?: HousingType;

  @IsString()
  @IsOptional()
  propertyType?: 'RETAIL' | 'OFFICE' | 'INDUSTRIAL' | 'RESIDENTIAL' | 'HOSPITALITY';

  @IsEnum(EmCountry)
  @IsOptional()
  country?: EmCountry;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  targetOccupancyRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  projectedRentalYield?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetWeight?: number;

  @IsBoolean()
  @IsOptional()
  isDevelopmentProject?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  developmentTimelineMonths?: number;
}

/**
 * Manufacturing exposure configuration
 */
export class ManufacturingExposureDto {
  @IsEnum(ManufacturingSector)
  @IsNotEmpty()
  sector: ManufacturingSector;

  @IsEnum(EmCountry)
  @IsOptional()
  country?: EmCountry;

  @IsString()
  @IsOptional()
  subsector?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  productionCapacity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  capacityUtilization?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetWeight?: number;

  @IsBoolean()
  @IsOptional()
  isExportOriented?: boolean;

  @IsString()
  @IsOptional()
  exportMarkets?: string;
}

/**
 * Mining exposure configuration
 */
export class MiningExposureDto {
  @IsEnum(MiningOperationType)
  @IsNotEmpty()
  operationType: MiningOperationType;

  @IsEnum(CommodityType)
  @IsNotEmpty()
  resourceType: CommodityType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specificResources?: string[];

  @IsEnum(EmCountry)
  @IsOptional()
  country?: EmCountry;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reserveLifeYears?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyProduction?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  allInSustainingCost?: number; // Per ounce/ton

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetWeight?: number;

  @IsBoolean()
  @IsOptional()
  hasEnvironmentalPermits?: boolean;
}

/**
 * Crypto exposure configuration
 */
export class CryptoExposureDto {
  @IsEnum(CryptoCategory)
  @IsNotEmpty()
  category: CryptoCategory;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specificAssets?: string[]; // e.g., ['BTC', 'ETH', 'SOL']

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  targetWeight?: number;

  @IsBoolean()
  @IsOptional()
  isStakingEnabled?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stakingYield?: number;

  @IsBoolean()
  @IsOptional()
  isCustodied?: boolean;

  @IsString()
  @IsOptional()
  custodian?: string;

  @IsBoolean()
  @IsOptional()
  usesDerivatives?: boolean;
}

/**
 * Combined asset allocation for multi-asset EM products
 */
export class AssetAllocationDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  commoditiesAllocation?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  equitiesAllocation?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  bondsAllocation?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  realEstateAllocation?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  manufacturingAllocation?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  miningAllocation?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  cryptoAllocation?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cashAllocation?: number;
}

/**
 * DTO for creating specialized emerging markets products
 */
export class CreateEmProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ProductType)
  @IsNotEmpty()
  baseProductType: ProductType;

  @IsEnum(EmProductSubType)
  @IsNotEmpty()
  emSubType: EmProductSubType;

  @IsEnum(EmRegion)
  @IsNotEmpty()
  targetRegion: EmRegion;

  @IsArray()
  @IsEnum(EmCountry, { each: true })
  @IsOptional()
  targetCountries?: EmCountry[];

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  minimumInvestment: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumInvestment?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  targetAum?: number;

  @IsEnum(RiskLevel)
  @IsNotEmpty()
  riskLevel: RiskLevel;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeStructureDto)
  feeStructures: FeeStructureDto[];

  @IsEnum(RedemptionFrequency)
  @IsNotEmpty()
  redemptionFrequency: RedemptionFrequency;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lockupPeriodDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  noticePeriodDays?: number;

  @IsBoolean()
  @IsOptional()
  isAccreditedOnly?: boolean;

  @IsString()
  @IsOptional()
  investmentStrategy?: string;

  @IsString()
  @IsOptional()
  fundManagerId?: string;

  // Asset-specific configurations
  @ValidateNested()
  @Type(() => CommodityExposureDto)
  @IsOptional()
  commodityExposure?: CommodityExposureDto;

  @ValidateNested()
  @Type(() => EquityExposureDto)
  @IsOptional()
  equityExposure?: EquityExposureDto;

  @ValidateNested()
  @Type(() => BondExposureDto)
  @IsOptional()
  bondExposure?: BondExposureDto;

  @ValidateNested()
  @Type(() => RealEstateExposureDto)
  @IsOptional()
  realEstateExposure?: RealEstateExposureDto;

  @ValidateNested()
  @Type(() => ManufacturingExposureDto)
  @IsOptional()
  manufacturingExposure?: ManufacturingExposureDto;

  @ValidateNested()
  @Type(() => MiningExposureDto)
  @IsOptional()
  miningExposure?: MiningExposureDto;

  @ValidateNested()
  @Type(() => CryptoExposureDto)
  @IsOptional()
  cryptoExposure?: CryptoExposureDto;

  // Multi-asset allocation
  @ValidateNested()
  @Type(() => AssetAllocationDto)
  @IsOptional()
  assetAllocation?: AssetAllocationDto;

  // ESG considerations
  @IsEnum(EsgRating)
  @IsOptional()
  esgRating?: EsgRating;

  @IsBoolean()
  @IsOptional()
  isShariaCompliant?: boolean;

  @IsBoolean()
  @IsOptional()
  hasImpactInvestingFocus?: boolean;

  // Risk management
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxSingleAssetExposure?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxCountryExposure?: number;

  @IsBoolean()
  @IsOptional()
  usesCurrencyHedging?: boolean;

  @IsBoolean()
  @IsOptional()
  usesDerivatives?: boolean;

  // Additional metadata
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benchmarkIndices?: string[];

  @IsString()
  @IsOptional()
  inceptionDate?: string;

  @IsString()
  @IsOptional()
  fiscalYearEnd?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentUrls?: string[];
}

/**
 * DTO for updating EM products
 */
export class UpdateEmProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumInvestment?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumInvestment?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeStructureDto)
  @IsOptional()
  feeStructures?: FeeStructureDto[];

  @IsEnum(RedemptionFrequency)
  @IsOptional()
  redemptionFrequency?: RedemptionFrequency;

  @IsString()
  @IsOptional()
  investmentStrategy?: string;

  @ValidateNested()
  @Type(() => AssetAllocationDto)
  @IsOptional()
  assetAllocation?: AssetAllocationDto;

  @IsEnum(EsgRating)
  @IsOptional()
  esgRating?: EsgRating;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxSingleAssetExposure?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxCountryExposure?: number;
}

/**
 * Filter DTO for querying EM products
 */
export class EmProductFilterDto {
  @IsEnum(ProductType)
  @IsOptional()
  baseProductType?: ProductType;

  @IsEnum(EmProductSubType)
  @IsOptional()
  emSubType?: EmProductSubType;

  @IsEnum(EmRegion)
  @IsOptional()
  targetRegion?: EmRegion;

  @IsEnum(EmCountry)
  @IsOptional()
  targetCountry?: EmCountry;

  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;

  @IsEnum(EsgRating)
  @IsOptional()
  esgRating?: EsgRating;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isAccreditedOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  isShariaCompliant?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}
