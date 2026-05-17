import { Injectable, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions, Like, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { CreateIndividualUserDto, CreateCorporateUserDto, UpdateUserDto, UpdateAdminUserDto, UserFilterDto, UserRole, UserStatus, KycStatus, AccreditationStatus } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createIndividualUser(dto: CreateIndividualUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
      withDeleted: true,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const referralCode = `REF-${uuidv4().substring(0, 8).toUpperCase()}`;

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      referralCode,
      emailVerified: false,
      status: UserStatus.PENDING,
      kycStatus: KycStatus.NOT_STARTED,
      accreditationStatus: AccreditationStatus.NOT_VERIFIED,
      permissions: this.getDefaultPermissions(dto.role || UserRole.INDIVIDUAL_INVESTOR),
    });

    return await this.userRepository.save(user);
  }

  async createCorporateUser(dto: CreateCorporateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
      withDeleted: true,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const referralCode = `REF-${uuidv4().substring(0, 8).toUpperCase()}`;

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      referralCode,
      emailVerified: false,
      status: UserStatus.PENDING,
      kycStatus: KycStatus.NOT_STARTED,
      accreditationStatus: AccreditationStatus.NOT_VERIFIED,
      role: UserRole.CORPORATE_INVESTOR,
      permissions: this.getDefaultPermissions(UserRole.CORPORATE_INVESTOR),
    });

    return await this.userRepository.save(user);
  }

  async findById(id: string, includeSensitive = false): Promise<User> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    if (includeSensitive) {
      queryBuilder.addSelect('user.password');
      queryBuilder.addSelect('user.mfaSecret');
    }

    const user = await queryBuilder
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string, includeSensitive = false): Promise<User> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email });
    
    if (includeSensitive) {
      queryBuilder.addSelect('user.password');
      queryBuilder.addSelect('user.mfaSecret');
    }

    const user = await queryBuilder.getOne();

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findAll(filters: UserFilterDto): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { role, status, kycStatus, accreditationStatus, search, sortBy = 'createdAt', sortOrder = 'DESC', page = '1', limit = '20' } = filters;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (kycStatus) {
      queryBuilder.andWhere('user.kycStatus = :kycStatus', { kycStatus });
    }

    if (accreditationStatus) {
      queryBuilder.andWhere('user.accreditationStatus = :accreditationStatus', { accreditationStatus });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.companyName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    queryBuilder.skip((pageNum - 1) * limitNum).take(limitNum);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page: pageNum, limit: limitNum };
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.password) {
      throw new BadRequestException('Cannot update password through this endpoint. Use changePassword instead.');
    }

    Object.assign(user, dto);
    return await this.userRepository.save(user);
  }

  async updateByAdmin(id: string, dto: UpdateAdminUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.role && dto.role !== user.role) {
      user.role = dto.role;
      user.permissions = this.getDefaultPermissions(dto.role);
    }

    if (dto.permissions) {
      user.permissions = dto.permissions;
    }

    delete dto.role;
    delete dto.permissions;
    Object.assign(user, dto);

    return await this.userRepository.save(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId, true);

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.softRemove(user);
  }

  async restore(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.userRepository.restore(id);
  }

  async recordLogin(id: string, ipAddress: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      loginAttempts: 0,
      lockedUntil: null,
    });
  }

  async recordFailedLogin(id: string, lockoutThreshold = 5, lockoutDurationMinutes = 30): Promise<number> {
    const user = await this.findById(id);
    const newAttempts = user.loginAttempts + 1;

    if (newAttempts >= lockoutThreshold) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + lockoutDurationMinutes);
      
      await this.userRepository.update(id, {
        loginAttempts: newAttempts,
        lockedUntil,
      });

      return newAttempts;
    }

    await this.userRepository.update(id, { loginAttempts: newAttempts });
    return newAttempts;
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.findById(id);
    user.emailVerified = true;
    return await this.userRepository.save(user);
  }

  async generateReferralCode(id: string): Promise<string> {
    const user = await this.findById(id);
    
    if (user.referralCode) {
      return user.referralCode;
    }

    const referralCode = `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
    user.referralCode = referralCode;
    await this.userRepository.save(user);
    
    return referralCode;
  }

  private getDefaultPermissions(role: UserRole): string[] {
    const basePermissions = ['profile:read', 'profile:update', 'wallet:read'];

    switch (role) {
      case UserRole.SUPER_ADMIN:
        return [
          ...basePermissions,
          '*:*', // All permissions
        ];
      case UserRole.ADMIN:
        return [
          ...basePermissions,
          'users:read', 'users:update',
          'products:read', 'products:create', 'products:update',
          'subscriptions:read', 'subscriptions:approve',
          'kyc:read', 'kyc:review',
          'reports:read', 'reports:generate',
          'audit:read',
        ];
      case UserRole.COMPLIANCE_OFFICER:
        return [
          ...basePermissions,
          'kyc:read', 'kyc:review', 'kyc:approve', 'kyc:reject',
          'users:read',
          'audit:read',
          'reports:read',
        ];
      case UserRole.FUND_MANAGER:
        return [
          ...basePermissions,
          'products:read', 'products:create', 'products:update',
          'portfolio:read', 'portfolio:manage',
          'investors:read',
          'reports:read', 'reports:generate',
        ];
      case UserRole.ANALYST:
        return [
          ...basePermissions,
          'products:read',
          'portfolio:read',
          'analytics:read',
          'reports:read',
        ];
      case UserRole.SYNDICATE_LEAD:
        return [
          ...basePermissions,
          'syndicates:read', 'syndicates:create', 'syndicates:manage',
          'deals:read', 'deals:create',
          'investors:read',
        ];
      case UserRole.STARTUP_FOUNDER:
        return [
          ...basePermissions,
          'startup:read', 'startup:update',
          'pitch:read', 'pitch:update',
          'dataroom:read', 'dataroom:update',
        ];
      default:
        return [
          ...basePermissions,
          'products:read',
          'subscriptions:read', 'subscriptions:create',
          'portfolio:read',
          'reports:read',
        ];
    }
  }
}
