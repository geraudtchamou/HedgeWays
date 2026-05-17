import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum AdminAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ROLE_ASSIGNMENT = 'ROLE_ASSIGNMENT',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  KYC_REVIEW = 'KYC_REVIEW',
  SUBSCRIPTION_APPROVE = 'SUBSCRIPTION_APPROVE',
  WITHDRAWAL_APPROVE = 'WITHDRAWAL_APPROVE',
  DISTRIBUTION_APPROVE = 'DISTRIBUTION_APPROVE',
}

export enum EntityType {
  USER = 'USER',
  PRODUCT = 'PRODUCT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  WALLET = 'WALLET',
  TRANSACTION = 'TRANSACTION',
  LEDGER_ENTRY = 'LEDGER_ENTRY',
  KYC_APPLICATION = 'KYC_APPLICATION',
  FUND = 'FUND',
  SYNDICATE = 'SYNDICATE',
  STARTUP = 'STARTUP',
  REPORT = 'REPORT',
  SYSTEM = 'SYSTEM',
  FEE_STRUCTURE = 'FEE_STRUCTURE',
  FEE_ACCRUAL = 'FEE_ACCRUAL',
  FEE_PAYMENT = 'FEE_PAYMENT',
  REVENUE_RECOGNITION = 'REVENUE_RECOGNITION',
}

export enum UserRole {
  INDIVIDUAL_INVESTOR = 'INDIVIDUAL_INVESTOR',
  CORPORATE_INVESTOR = 'CORPORATE_INVESTOR',
  FUND_MANAGER = 'FUND_MANAGER',
  ANGEL_INVESTOR = 'ANGEL_INVESTOR',
  SYNDICATE_LEAD = 'SYNDICATE_LEAD',
  STARTUP_FOUNDER = 'STARTUP_FOUNDER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  ANALYST = 'ANALYST',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsArray()
  @IsOptional()
  permissions?: string[];
}

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AuditLogFilterDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsEnum(AdminAction)
  @IsOptional()
  action?: AdminAction;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}

export class DashboardStatsDto {
  @IsString()
  @IsOptional()
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}
