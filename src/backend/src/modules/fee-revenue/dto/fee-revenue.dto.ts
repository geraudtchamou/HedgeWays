import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean, IsDate, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum FeeCategory {
  MANAGEMENT = 'MANAGEMENT',
  PERFORMANCE = 'PERFORMANCE',
  ENTRY_LOAD = 'ENTRY_LOAD',
  EXIT_LOAD = 'EXIT_LOAD',
  ADMINISTRATION = 'ADMINISTRATION',
  CUSTODY = 'CUSTODY',
  AUDIT = 'AUDIT',
  LEGAL = 'LEGAL',
  TRANSACTION = 'TRANSACTION',
  WITHDRAWAL = 'WITHDRAWAL',
  SWITCHING = 'SWITCHING',
}

export enum RevenueType {
  FEE_INCOME = 'FEE_INCOME',
  INTEREST_INCOME = 'INTEREST_INCOME',
  DIVIDEND_INCOME = 'DIVIDEND_INCOME',
  CAPITAL_GAINS = 'CAPITAL_GAINS',
  OTHER_INCOME = 'OTHER_INCOME',
}

export enum FeeCalculationMethod {
  PERCENTAGE_AUM = 'PERCENTAGE_AUM',
  PERCENTAGE_NAV = 'PERCENTAGE_NAV',
  FLAT_AMOUNT = 'FLAT_AMOUNT',
  TIERED_PERCENTAGE = 'TIERED_PERCENTAGE',
  HURDLE_RATE_BASED = 'HURDLE_RATE_BASED',
  HIGH_WATER_MARK_BASED = 'HIGH_WATER_MARK_BASED',
}

export enum AccrualFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
  ON_TRANSACTION = 'ON_TRANSACTION',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  ACCRUED = 'ACCRUED',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
  WAIVED = 'WAIVED',
  DEFERRED = 'DEFERRED',
}

export class TieredFeeDto {
  @IsNumber()
  @IsNotEmpty()
  threshold: number;

  @IsNumber()
  @IsNotEmpty()
  percentage: number;
}

export class CreateFeeStructureDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsEnum(FeeCategory)
  @IsNotEmpty()
  category: FeeCategory;

  @IsEnum(FeeCalculationMethod)
  @IsNotEmpty()
  calculationMethod: FeeCalculationMethod;

  @IsNumber()
  @IsNotEmpty()
  percentage: number;

  @IsNumber()
  @IsOptional()
  flatAmount?: number;

  @IsNumber()
  @IsOptional()
  minimumAmount?: number;

  @IsNumber()
  @IsOptional()
  maximumAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TieredFeeDto)
  @IsOptional()
  tieredFees?: TieredFeeDto[];

  @IsBoolean()
  @IsOptional()
  isHighWaterMark?: boolean;

  @IsNumber()
  @IsOptional()
  hurdleRate?: number;

  @IsEnum(AccrualFrequency)
  @IsNotEmpty()
  accrualFrequency: AccrualFrequency;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateFeeStructureDto {
  @IsNumber()
  @IsOptional()
  percentage?: number;

  @IsNumber()
  @IsOptional()
  flatAmount?: number;

  @IsNumber()
  @IsOptional()
  minimumAmount?: number;

  @IsNumber()
  @IsOptional()
  maximumAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TieredFeeDto)
  @IsOptional()
  tieredFees?: TieredFeeDto[];

  @IsBoolean()
  @IsOptional()
  isHighWaterMark?: boolean;

  @IsNumber()
  @IsOptional()
  hurdleRate?: number;

  @IsEnum(AccrualFrequency)
  @IsOptional()
  accrualFrequency?: AccrualFrequency;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CalculateFeeDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  feeStructureId: string;

  @IsNumber()
  @IsNotEmpty()
  aum: number;

  @IsNumber()
  @IsOptional()
  navPerShare?: number;

  @IsNumber()
  @IsOptional()
  previousNavPerShare?: number;

  @IsDate()
  @IsNotEmpty()
  calculationDate: Date;

  @IsString()
  @IsOptional()
  investorId?: string;

  @IsNumber()
  @IsOptional()
  investmentAmount?: number;
}

export class FeeAccrualDto {
  @IsString()
  @IsNotEmpty()
  feeStructureId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  investorId?: string;

  @IsNumber()
  @IsNotEmpty()
  accruedAmount: number;

  @IsDate()
  @IsNotEmpty()
  accrualDate: Date;

  @IsDate()
  @IsNotEmpty()
  dueDate: Date;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProcessFeePaymentDto {
  @IsString()
  @IsNotEmpty()
  accrualId: string;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @IsDate()
  @IsOptional()
  paymentDate?: Date;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RevenueRecognitionDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsEnum(RevenueType)
  @IsNotEmpty()
  revenueType: RevenueType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDate()
  @IsNotEmpty()
  recognitionDate: Date;

  @IsString()
  @IsOptional()
  sourceId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class FeeReportFilterDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsEnum(FeeCategory)
  @IsOptional()
  category?: FeeCategory;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
