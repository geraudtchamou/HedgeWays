import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AdminAction, EntityType, AuditLogFilterDto } from '../dto/admin.dto';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingKyc: number;
  totalAum: number;
  totalProducts: number;
  activeSubscriptions: number;
  todayTransactions: number;
  todayVolume: number;
  userGrowth: Array<{ date: string; count: number }>;
  recentActivities: Array<{ action: string; entity: string; timestamp: Date }>;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(params: {
    userId: string;
    userName: string;
    userRole: string;
    action: AdminAction;
    entityType: EntityType;
    entityId?: string;
    entityName?: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    remarks?: string;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(params);
    return await this.auditLogRepository.save(auditLog);
  }

  async findAll(filters: AuditLogFilterDto): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const {
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate,
      ipAddress,
      search,
      page = '1',
      limit = '20',
    } = filters;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    if (ipAddress) {
      queryBuilder.andWhere('audit.ipAddress = :ipAddress', { ipAddress });
    }

    if (search) {
      queryBuilder.andWhere(
        '(audit.userName ILIKE :search OR audit.entityName ILIKE :search OR audit.remarks ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('audit.createdAt', 'DESC');

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    queryBuilder.skip((pageNum - 1) * limitNum).take(limitNum);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page: pageNum, limit: limitNum };
  }

  async findById(id: string): Promise<AuditLog> {
    return await this.auditLogRepository.findOne({ where: { id } });
  }

  async findByEntity(entityType: EntityType, entityId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserActivity(userId: string, limit = 50): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getDashboardStats(period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<DashboardStats> {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get user growth data
    const userGrowthRaw = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select("DATE_TRUNC('day', audit.createdAt)", 'date')
      .addSelect('COUNT(DISTINCT audit.userId)', 'count')
      .where('audit.action = :action', { action: AdminAction.CREATE })
      .andWhere('audit.entityType = :entityType', { entityType: EntityType.USER })
      .andWhere('audit.createdAt >= :startDate', { startDate })
      .groupBy("DATE_TRUNC('day', audit.createdAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    const userGrowth = userGrowthRaw.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
    }));

    // Get recent activities
    const recentActivities = await this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: 20,
      select: ['action', 'entityName', 'createdAt'],
    });

    return {
      totalUsers: 0, // Would need to query users table
      activeUsers: 0,
      pendingKyc: 0,
      totalAum: 0, // Would need to query wallets/products
      totalProducts: 0,
      activeSubscriptions: 0,
      todayTransactions: 0,
      todayVolume: 0,
      userGrowth,
      recentActivities: recentActivities.map((a) => ({
        action: a.action,
        entity: a.entityName || 'Unknown',
        timestamp: a.createdAt,
      })),
    };
  }

  async getComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const kycReviews = await this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.action = :action', { action: AdminAction.KYC_REVIEW })
      .andWhere('audit.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    const subscriptionApprovals = await this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.action = :action', { action: AdminAction.SUBSCRIPTION_APPROVE })
      .andWhere('audit.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    return {
      period: { startDate, endDate },
      kycReviews: {
        total: kycReviews.length,
        approved: kycReviews.filter((r) => r.metadata?.status === 'APPROVED').length,
        rejected: kycReviews.filter((r) => r.metadata?.status === 'REJECTED').length,
      },
      subscriptionApprovals: {
        total: subscriptionApprovals.length,
        totalValue: subscriptionApprovals.reduce((sum, s) => sum + (s.metadata?.amount || 0), 0),
      },
    };
  }
}
