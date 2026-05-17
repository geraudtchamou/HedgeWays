import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductType {
  HEDGE_FUND = 'HEDGE_FUND',
  MUTUAL_FUND = 'MUTUAL_FUND',
  ETF = 'ETF',
  PRIVATE_EQUITY = 'PRIVATE_EQUITY',
  REAL_ESTATE = 'REAL_ESTATE',
  COMMODITY = 'COMMODITY',
  CRYPTO_FUND = 'CRYPTO_FUND',
  ANGEL_SYNDICATE = 'ANGEL_SYNDICATE',
  SPV = 'SPV',
  TRUST_FUND = 'TRUST_FUND',
  STRUCTURED_PRODUCT = 'STRUCTURED_PRODUCT',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  LIQUIDATED = 'LIQUIDATED',
}

export enum FeeType {
  MANAGEMENT = 'MANAGEMENT',
  PERFORMANCE = 'PERFORMANCE',
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  ADMINISTRATION = 'ADMINISTRATION',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum RedemptionFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
  LOCK_UP = 'LOCK_UP',
}

export class FeeStructureDto {
  @IsEnum(FeeType)
  @IsNotEmpty()
  type: FeeType;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  percentage: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumAmount?: number;

  @IsBoolean()
  @IsOptional()
  isHighWaterMark?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hurdleRate?: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ProductType)
  @IsNotEmpty()
  type: ProductType;

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

  @IsArray()
  @IsOptional()
  allowedCountries?: string[];

  @IsArray()
  @IsOptional()
  restrictedCountries?: string[];

  @IsString()
  @IsOptional()
  inceptionDate?: string;

  @IsString()
  @IsOptional()
  fiscalYearEnd?: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumInvestment?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumInvestment?: number;

  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeStructureDto)
  @IsOptional()
  feeStructures?: FeeStructureDto[];

  @IsEnum(RedemptionFrequency)
  @IsOptional()
  redemptionFrequency?: RedemptionFrequency;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lockupPeriodDays?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  noticePeriodDays?: number;

  @IsString()
  @IsOptional()
  investmentStrategy?: string;

  @IsString()
  @IsOptional()
  fundManagerId?: string;
}

export class ProductFilterDto {
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isAccreditedOnly?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}

export class UpdateNavDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  navPerShare: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  totalAum: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  totalShares: number;

  @IsString()
  @IsNotEmpty()
  valuationDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
