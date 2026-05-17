import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { FeeStructure, FeeAccrual, FeePayment, RevenueRecognition } from '../entities/fee-structure.entity';
import { 
  CreateFeeStructureDto, 
  UpdateFeeStructureDto, 
  CalculateFeeDto, 
  FeeAccrualDto, 
  ProcessFeePaymentDto,
  RevenueRecognitionDto,
  FeeReportFilterDto,
  FeeCategory,
  FeeCalculationMethod,
  AccrualFrequency,
  PaymentStatus,
} from '../dto/fee-revenue.dto';
import { ProductService } from '../../product/services/product.service';
import { AdminService } from '../../admin/services/admin.service';
import { AdminAction, EntityType } from '../../admin/dto/admin.dto';

@Injectable()
export class FeeRevenueService {
  constructor(
    @InjectRepository(FeeStructure)
    private readonly feeStructureRepository: Repository<FeeStructure>,
    @InjectRepository(FeeAccrual)
    private readonly feeAccrualRepository: Repository<FeeAccrual>,
    @InjectRepository(FeePayment)
    private readonly feePaymentRepository: Repository<FeePayment>,
    @InjectRepository(RevenueRecognition)
    private readonly revenueRecognitionRepository: Repository<RevenueRecognition>,
    private readonly productService: ProductService,
    private readonly adminService: AdminService,
  ) {}

  // ==================== Fee Structure Management ====================

  async createFeeStructure(dto: CreateFeeStructureDto, userId: string, userName: string): Promise<FeeStructure> {
    const product = await this.productService.findById(dto.productId);

    if (dto.percentage > 100 || dto.percentage < 0) {
      throw new BadRequestException('Fee percentage must be between 0 and 100');
    }

    if (dto.tieredFees && dto.tieredFees.length > 0) {
      for (const tier of dto.tieredFees) {
        if (tier.percentage > 100 || tier.percentage < 0) {
          throw new BadRequestException('Tiered fee percentage must be between 0 and 100');
        }
      }
    }

    const feeStructure = this.feeStructureRepository.create({
      productId: dto.productId,
      category: dto.category,
      calculationMethod: dto.calculationMethod,
      percentage: dto.percentage,
      flatAmount: dto.flatAmount || null,
      minimumAmount: dto.minimumAmount || null,
      maximumAmount: dto.maximumAmount || null,
      tieredFees: dto.tieredFees || null,
      isHighWaterMark: dto.isHighWaterMark || false,
      hurdleRate: dto.hurdleRate || null,
      accrualFrequency: dto.accrualFrequency,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      description: dto.description || null,
    });

    const savedFeeStructure = await this.feeStructureRepository.save(feeStructure);

    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.CREATE,
      entityType: EntityType.FEE_STRUCTURE,
      entityId: savedFeeStructure.id,
      entityName: `${dto.category} - ${product.name}`,
      metadata: { category: dto.category, calculationMethod: dto.calculationMethod },
    });

    return savedFeeStructure;
  }

  async getFeeStructure(id: string): Promise<FeeStructure> {
    const feeStructure = await this.feeStructureRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!feeStructure) {
      throw new NotFoundException(`Fee structure with ID ${id} not found`);
    }

    return feeStructure;
  }

  async getFeeStructuresByProduct(productId: string, includeInactive: boolean = false): Promise<FeeStructure[]> {
    const queryBuilder = this.feeStructureRepository.createQueryBuilder('fee')
      .where('fee.productId = :productId', { productId })
      .leftJoinAndSelect('fee.product', 'product');

    if (!includeInactive) {
      queryBuilder.andWhere('fee.isActive = :isActive', { isActive: true });
    }

    return await queryBuilder.getMany();
  }

  async updateFeeStructure(id: string, dto: UpdateFeeStructureDto, userId: string, userName: string): Promise<FeeStructure> {
    const feeStructure = await this.getFeeStructure(id);

    if (dto.percentage !== undefined && (dto.percentage > 100 || dto.percentage < 0)) {
      throw new BadRequestException('Fee percentage must be between 0 and 100');
    }

    const changes: Record<string, any> = {};
    for (const key in dto) {
      if (dto[key] !== undefined && feeStructure[key] !== dto[key]) {
        changes[key] = { old: feeStructure[key], new: dto[key] };
      }
    }

    Object.assign(feeStructure, dto);
    const updatedFeeStructure = await this.feeStructureRepository.save(feeStructure);

    if (Object.keys(changes).length > 0) {
      await this.adminService.logAction({
        userId,
        userName,
        userRole: 'ADMIN',
        action: AdminAction.UPDATE,
        entityType: EntityType.FEE_STRUCTURE,
        entityId: updatedFeeStructure.id,
        entityName: `${updatedFeeStructure.category} - ${updatedFeeStructure.product?.name}`,
        changes,
      });
    }

    return updatedFeeStructure;
  }

  async deactivateFeeStructure(id: string, userId: string, userName: string): Promise<void> {
    const feeStructure = await this.getFeeStructure(id);
    feeStructure.isActive = false;
    await this.feeStructureRepository.save(feeStructure);

    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.UPDATE,
      entityType: EntityType.FEE_STRUCTURE,
      entityId: feeStructure.id,
      entityName: `${feeStructure.category} - ${feeStructure.product?.name}`,
      metadata: { isActive: false },
    });
  }

  // ==================== Fee Calculation ====================

  async calculateFee(dto: CalculateFeeDto): Promise<{ feeAmount: number; details: Record<string, any> }> {
    const feeStructure = await this.getFeeStructure(dto.feeStructureId);

    let feeAmount = 0;
    const details: Record<string, any> = {
      baseAmount: 0,
      appliedRate: 0,
      calculationMethod: feeStructure.calculationMethod,
      category: feeStructure.category,
    };

    switch (feeStructure.calculationMethod) {
      case FeeCalculationMethod.PERCENTAGE_AUM:
        feeAmount = (dto.aum * feeStructure.percentage) / 100;
        details.baseAmount = dto.aum;
        details.appliedRate = feeStructure.percentage;
        break;

      case FeeCalculationMethod.PERCENTAGE_NAV:
        if (!dto.navPerShare || !dto.previousNavPerShare) {
          throw new BadRequestException('NAV per share and previous NAV per share are required for NAV-based calculation');
        }
        const navGrowth = dto.navPerShare - dto.previousNavPerShare;
        if (navGrowth <= 0 && feeStructure.category === 'PERFORMANCE') {
          feeAmount = 0;
        } else {
          feeAmount = (Math.abs(navGrowth) * feeStructure.percentage) / 100;
        }
        details.baseAmount = Math.abs(navGrowth);
        details.appliedRate = feeStructure.percentage;
        details.navGrowth = navGrowth;
        break;

      case FeeCalculationMethod.FLAT_AMOUNT:
        feeAmount = feeStructure.flatAmount || 0;
        details.baseAmount = 0;
        details.appliedRate = 0;
        break;

      case FeeCalculationMethod.TIERED_PERCENTAGE:
        if (!feeStructure.tieredFees || feeStructure.tieredFees.length === 0) {
          throw new BadRequestException('Tiered fees not configured for this fee structure');
        }
        let remainingAmount = dto.aum;
        let totalFee = 0;
        const sortedTiers = [...feeStructure.tieredFees].sort((a, b) => a.threshold - b.threshold);
        
        for (let i = 0; i < sortedTiers.length; i++) {
          const tier = sortedTiers[i];
          const nextTierThreshold = i < sortedTiers.length - 1 ? sortedTiers[i + 1].threshold : Infinity;
          const tierAmount = Math.min(remainingAmount, nextTierThreshold - tier.threshold);
          
          if (tierAmount > 0) {
            totalFee += (tierAmount * tier.percentage) / 100;
            remainingAmount -= tierAmount;
          }
        }
        feeAmount = totalFee;
        details.baseAmount = dto.aum;
        details.tierBreakdown = sortedTiers;
        break;

      case FeeCalculationMethod.HURDLE_RATE_BASED:
        if (!feeStructure.hurdleRate) {
          throw new BadRequestException('Hurdle rate not configured for this fee structure');
        }
        if (!dto.navPerShare || !dto.previousNavPerShare) {
          throw new BadRequestException('NAV per share and previous NAV per share are required for hurdle rate calculation');
        }
        const returnRate = ((dto.navPerShare - dto.previousNavPerShare) / dto.previousNavPerShare) * 100;
        if (returnRate > feeStructure.hurdleRate) {
          const excessReturn = returnRate - feeStructure.hurdleRate;
          feeAmount = (dto.aum * excessReturn * feeStructure.percentage) / 10000;
        }
        details.baseAmount = dto.aum;
        details.appliedRate = feeStructure.percentage;
        details.returnRate = returnRate;
        details.hurdleRate = feeStructure.hurdleRate;
        details.excessReturn = Math.max(0, returnRate - feeStructure.hurdleRate);
        break;

      case FeeCalculationMethod.HIGH_WATER_MARK_BASED:
        if (!feeStructure.isHighWaterMark) {
          throw new BadRequestException('High water mark not enabled for this fee structure');
        }
        if (!dto.navPerShare) {
          throw new BadRequestException('NAV per share is required for high water mark calculation');
        }
        // High water mark logic would need the historical high water mark value
        // This is simplified - in production, fetch from product entity
        const highWaterMark = dto.previousNavPerShare || 0;
        if (dto.navPerShare > highWaterMark) {
          const gainAboveHwm = dto.navPerShare - highWaterMark;
          feeAmount = (gainAboveHwm * feeStructure.percentage) / 100;
        }
        details.baseAmount = Math.max(0, dto.navPerShare - highWaterMark);
        details.appliedRate = feeStructure.percentage;
        details.highWaterMark = highWaterMark;
        break;
    }

    // Apply min/max constraints
    if (feeStructure.minimumAmount && feeAmount < feeStructure.minimumAmount) {
      feeAmount = feeStructure.minimumAmount;
      details.appliedMinimum = true;
    }

    if (feeStructure.maximumAmount && feeAmount > feeStructure.maximumAmount) {
      feeAmount = feeStructure.maximumAmount;
      details.appliedMaximum = true;
    }

    return {
      feeAmount: parseFloat(feeAmount.toFixed(2)),
      details,
    };
  }

  // ==================== Fee Accrual Management ====================

  async createAccrual(dto: FeeAccrualDto, userId: string, userName: string): Promise<FeeAccrual> {
    const feeStructure = await this.getFeeStructure(dto.feeStructureId);

    const accrual = this.feeAccrualRepository.create({
      feeStructureId: dto.feeStructureId,
      productId: dto.productId,
      investorId: dto.investorId || null,
      accruedAmount: dto.accruedAmount,
      accrualDate: dto.accrualDate,
      dueDate: dto.dueDate,
      reference: dto.reference || null,
      notes: dto.notes || null,
    });

    const savedAccrual = await this.feeAccrualRepository.save(accrual);

    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.CREATE,
      entityType: EntityType.FEE_ACCRUAL,
      entityId: savedAccrual.id,
      entityName: `Accrual - ${feeStructure.category}`,
      metadata: { amount: dto.accruedAmount, dueDate: dto.dueDate },
    });

    return savedAccrual;
  }

  async processAccrualsForProduct(productId: string, calculationDate: Date, userId: string, userName: string): Promise<FeeAccrual[]> {
    const product = await this.productService.findById(productId);
    const feeStructures = await this.getFeeStructuresByProduct(productId, false);
    const createdAccruals: FeeAccrual[] = [];

    for (const feeStructure of feeStructures) {
      if (!this.shouldAccrueOnDate(feeStructure.accrualFrequency, calculationDate)) {
        continue;
      }

      const calculationResult = await this.calculateFee({
        productId,
        feeStructureId: feeStructure.id,
        aum: product.currentAum,
        navPerShare: product.navPerShare,
        calculationDate,
      });

      if (calculationResult.feeAmount > 0) {
        const dueDate = this.calculateDueDate(feeStructure.accrualFrequency, calculationDate);
        
        const accrual = this.feeAccrualRepository.create({
          feeStructureId: feeStructure.id,
          productId,
          accruedAmount: calculationResult.feeAmount,
          currency: product.currency,
          accrualDate: calculationDate,
          dueDate,
          baseAmount: calculationResult.details.baseAmount,
          appliedRate: calculationResult.details.appliedRate,
          calculationDetails: calculationResult.details,
          reference: `ACCR-${productId}-${feeStructure.category}-${calculationDate.toISOString().split('T')[0]}`,
        });

        const savedAccrual = await this.feeAccrualRepository.save(accrual);
        createdAccruals.push(savedAccrual);
      }
    }

    return createdAccruals;
  }

  private shouldAccrueOnDate(frequency: AccrualFrequency, date: Date): boolean {
    const day = date.getDate();
    const month = date.getMonth();
    const dayOfWeek = date.getDay();

    switch (frequency) {
      case AccrualFrequency.DAILY:
        return true;
      case AccrualFrequency.WEEKLY:
        return dayOfWeek === 5; // Friday
      case AccrualFrequency.MONTHLY:
        return day === 1 || day === 31; // First or last day
      case AccrualFrequency.QUARTERLY:
        return [2, 5, 8, 11].includes(month) && day === 30; // End of quarter
      case AccrualFrequency.ANNUAL:
        return month === 11 && day === 31; // December 31
      case AccrualFrequency.ON_TRANSACTION:
        return true;
      default:
        return false;
    }
  }

  private calculateDueDate(frequency: AccrualFrequency, accrualDate: Date): Date {
    const dueDate = new Date(accrualDate);
    
    switch (frequency) {
      case AccrualFrequency.DAILY:
        dueDate.setDate(dueDate.getDate() + 1);
        break;
      case AccrualFrequency.WEEKLY:
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      case AccrualFrequency.MONTHLY:
        dueDate.setMonth(dueDate.getMonth() + 1);
        break;
      case AccrualFrequency.QUARTERLY:
        dueDate.setMonth(dueDate.getMonth() + 3);
        break;
      case AccrualFrequency.ANNUAL:
        dueDate.setFullYear(dueDate.getFullYear() + 1);
        break;
      case AccrualFrequency.ON_TRANSACTION:
        dueDate.setDate(dueDate.getDate() + 30);
        break;
    }

    return dueDate;
  }

  async getAccruals(filters: { productId?: string; investorId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<FeeAccrual[]> {
    const queryBuilder = this.feeAccrualRepository.createQueryBuilder('accrual')
      .leftJoinAndSelect('accrual.feeStructure', 'feeStructure');

    if (filters.productId) {
      queryBuilder.andWhere('accrual.productId = :productId', { productId: filters.productId });
    }

    if (filters.investorId) {
      queryBuilder.andWhere('accrual.investorId = :investorId', { investorId: filters.investorId });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('accrual.accrualDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters.startDate) {
      queryBuilder.andWhere('accrual.accrualDate >= :startDate', { startDate: filters.startDate });
    } else if (filters.endDate) {
      queryBuilder.andWhere('accrual.accrualDate <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('accrual.accrualDate', 'DESC');

    return await queryBuilder.getMany();
  }

  // ==================== Fee Payment Processing ====================

  async processPayment(dto: ProcessFeePaymentDto, userId: string, userName: string): Promise<FeePayment> {
    const accrual = await this.feeAccrualRepository.findOne({
      where: { id: dto.accrualId },
      relations: ['feeStructure'],
    });

    if (!accrual) {
      throw new NotFoundException(`Accrual with ID ${dto.accrualId} not found`);
    }

    const payment = this.feePaymentRepository.create({
      accrualId: dto.accrualId,
      productId: accrual.productId,
      investorId: accrual.investorId,
      amount: accrual.accruedAmount,
      currency: accrual.currency,
      status: dto.status,
      paymentDate: dto.paymentDate || new Date(),
      paymentReference: dto.paymentReference || null,
      notes: dto.notes || null,
    });

    const savedPayment = await this.feePaymentRepository.save(payment);

    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.CREATE,
      entityType: EntityType.FEE_PAYMENT,
      entityId: savedPayment.id,
      entityName: `Payment - ${accrual.feeStructure?.category}`,
      metadata: { amount: accrual.accruedAmount, status: dto.status },
    });

    return savedPayment;
  }

  async getPayments(filters: { productId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<FeePayment[]> {
    const queryBuilder = this.feePaymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.accrual', 'accrual')
      .leftJoinAndSelect('accrual.feeStructure', 'feeStructure');

    if (filters.productId) {
      queryBuilder.andWhere('payment.productId = :productId', { productId: filters.productId });
    }

    if (filters.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('payment.paymentDate', 'DESC');

    return await queryBuilder.getMany();
  }

  // ==================== Revenue Recognition ====================

  async recognizeRevenue(dto: RevenueRecognitionDto, userId: string, userName: string): Promise<RevenueRecognition> {
    const revenue = this.revenueRecognitionRepository.create({
      productId: dto.productId,
      revenueType: dto.revenueType,
      amount: dto.amount,
      recognitionDate: dto.recognitionDate,
      sourceId: dto.sourceId || null,
      description: dto.description || null,
    });

    const savedRevenue = await this.revenueRecognitionRepository.save(revenue);

    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.CREATE,
      entityType: EntityType.REVENUE_RECOGNITION,
      entityId: savedRevenue.id,
      entityName: `${dto.revenueType} - ${dto.amount}`,
      metadata: { revenueType: dto.revenueType, amount: dto.amount },
    });

    return savedRevenue;
  }

  async getRevenueRecognitions(filters: { productId?: string; revenueType?: string; startDate?: Date; endDate?: Date }): Promise<RevenueRecognition[]> {
    const queryBuilder = this.revenueRecognitionRepository.createQueryBuilder('revenue');

    if (filters.productId) {
      queryBuilder.andWhere('revenue.productId = :productId', { productId: filters.productId });
    }

    if (filters.revenueType) {
      queryBuilder.andWhere('revenue.revenueType = :revenueType', { revenueType: filters.revenueType });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('revenue.recognitionDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    queryBuilder.orderBy('revenue.recognitionDate', 'DESC');

    return await queryBuilder.getMany();
  }

  // ==================== Reporting & Analytics ====================

  async getFeeReport(filters: FeeReportFilterDto): Promise<any> {
    const queryBuilder = this.feeAccrualRepository.createQueryBuilder('accrual')
      .leftJoinAndSelect('accrual.feeStructure', 'feeStructure')
      .leftJoinAndSelect('feeStructure.product', 'product');

    if (filters.productId) {
      queryBuilder.andWhere('accrual.productId = :productId', { productId: filters.productId });
    }

    if (filters.category) {
      queryBuilder.andWhere('feeStructure.category = :category', { category: filters.category });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('accrual.accrualDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const accruals = await queryBuilder.getMany();

    const totalAccrued = accruals.reduce((sum, a) => sum + a.accruedAmount, 0);
    const byCategory = {};
    const byProduct = {};

    accruals.forEach((accrual) => {
      const category = accrual.feeStructure?.category || 'UNKNOWN';
      const productName = accrual.feeStructure?.product?.name || 'UNKNOWN';

      if (!byCategory[category]) {
        byCategory[category] = 0;
      }
      byCategory[category] += accrual.accruedAmount;

      if (!byProduct[productName]) {
        byProduct[productName] = 0;
      }
      byProduct[productName] += accrual.accruedAmount;
    });

    return {
      totalAccrued,
      byCategory,
      byProduct,
      accrualCount: accruals.length,
      period: {
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    };
  }

  async getProductRevenueSummary(productId: string, startDate: Date, endDate: Date): Promise<any> {
    const [accruals, payments, revenues] = await Promise.all([
      this.getAccruals({ productId, startDate, endDate }),
      this.getPayments({ productId, startDate, endDate }),
      this.getRevenueRecognitions({ productId, startDate, endDate }),
    ]);

    const totalAccrued = accruals.reduce((sum, a) => sum + a.accruedAmount, 0);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

    return {
      productId,
      period: { startDate, endDate },
      feeAccruals: {
        total: totalAccrued,
        count: accruals.length,
        byCategory: this.groupByCategory(accruals.map(a => ({ category: a.feeStructure?.category, amount: a.accruedAmount }))),
      },
      feePayments: {
        total: totalPaid,
        count: payments.length,
      },
      revenueRecognitions: {
        total: totalRevenue,
        count: revenues.length,
        byType: this.groupByType(revenues.map(r => ({ type: r.revenueType, amount: r.amount }))),
      },
      netRevenue: totalRevenue - totalAccrued,
    };
  }

  private groupByCategory(items: Array<{ category: string; amount: number }>): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});
  }

  private groupByType(items: Array<{ type: string; amount: number }>): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.amount;
      return acc;
    }, {});
  }
}
