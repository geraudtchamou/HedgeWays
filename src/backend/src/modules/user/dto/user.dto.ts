import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, ValidateNested, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

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

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum AccreditationStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  PENDING = 'PENDING',
  ACCREDITED = 'ACCREDITED',
  NON_ACCREDITED = 'NON_ACCREDITED',
}

export class CreateIndividualUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class CreateCorporateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  taxId: string;

  @IsString()
  @IsNotEmpty()
  authorizedFirstName: string;

  @IsString()
  @IsNotEmpty()
  authorizedLastName: string;

  @IsString()
  @IsNotEmpty()
  authorizedTitle: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsEnum(KycStatus)
  @IsOptional()
  kycStatus?: KycStatus;

  @IsEnum(AccreditationStatus)
  @IsOptional()
  accreditationStatus?: AccreditationStatus;
}

export class UpdateAdminUserDto extends UpdateUserDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsArray()
  @IsOptional()
  permissions?: string[];
}

export class UserFilterDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsEnum(KycStatus)
  @IsOptional()
  kycStatus?: KycStatus;

  @IsEnum(AccreditationStatus)
  @IsOptional()
  accreditationStatus?: AccreditationStatus;

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
