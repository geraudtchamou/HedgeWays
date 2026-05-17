import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { NavHistory } from './entities/nav-history.entity';
import { CreateProductDto, UpdateProductDto, ProductFilterDto, UpdateNavDto, ProductStatus, RiskLevel } from '../dto/product.dto';
import { AdminService } from '../../admin/services/admin.service';
import { AdminAction, EntityType } from '../../admin/dto/admin.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(NavHistory)
    private readonly navHistoryRepository: Repository<NavHistory>,
    private readonly adminService: AdminService,
  ) {}

  async create(dto: CreateProductDto, userId: string, userName: string): Promise<Product> {
    const existing = await this.productRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Product with this name already exists');
    }

    if (dto.feeStructures && dto.feeStructures.length > 0) {
      for (const fee of dto.feeStructures) {
        if (fee.percentage > 100 || fee.percentage < 0) {
          throw new BadRequestException('Fee percentage must be between 0 and 100');
        }
      }
    }

    const product = this.productRepository.create({
      ...dto,
      status: ProductStatus.DRAFT,
      currentAum: 0,
      navPerShare: 0,
      totalShares: 0,
      highWaterMark: 0,
      totalInvestors: 0,
      activeSubscriptions: 0,
    });

    const savedProduct = await this.productRepository.save(product);

    // Log audit
    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.CREATE,
      entityType: EntityType.PRODUCT,
      entityId: savedProduct.id,
      entityName: savedProduct.name,
      metadata: { type: dto.type, riskLevel: dto.riskLevel },
    });

    return savedProduct;
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['fundManager'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findAll(filters: ProductFilterDto): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const { type, status, riskLevel, currency, isAccreditedOnly, search, sortBy = 'createdAt', sortOrder = 'DESC', page = '1', limit = '20' } = filters;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (type) {
      queryBuilder.andWhere('product.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    if (riskLevel) {
      queryBuilder.andWhere('product.riskLevel = :riskLevel', { riskLevel });
    }

    if (currency) {
      queryBuilder.andWhere('product.currency = :currency', { currency });
    }

    if (isAccreditedOnly !== undefined) {
      queryBuilder.andWhere('product.isAccreditedOnly = :isAccreditedOnly', { isAccreditedOnly });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Only show active products to non-admin users (this filter should be enhanced based on user role)
    queryBuilder.andWhere('product.status IN (:...statuses)', { statuses: [ProductStatus.ACTIVE, ProductStatus.PENDING_APPROVAL] });

    queryBuilder.orderBy(`product.${sortBy}`, sortOrder);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    queryBuilder.skip((pageNum - 1) * limitNum).take(limitNum);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page: pageNum, limit: limitNum };
  }

  async update(id: string, dto: UpdateProductDto, userId: string, userName: string): Promise<Product> {
    const product = await this.findById(id);

    if (dto.feeStructures && dto.feeStructures.length > 0) {
      for (const fee of dto.feeStructures) {
        if (fee.percentage > 100 || fee.percentage < 0) {
          throw new BadRequestException('Fee percentage must be between 0 and 100');
        }
      }
    }

    const changes: Record<string, any> = {};
    for (const key in dto) {
      if (dto[key] !== undefined && product[key] !== dto[key]) {
        changes[key] = { old: product[key], new: dto[key] };
      }
    }

    Object.assign(product, dto);
    const updatedProduct = await this.productRepository.save(product);

    // Log audit
    if (Object.keys(changes).length > 0) {
      await this.adminService.logAction({
        userId,
        userName,
        userRole: 'ADMIN',
        action: AdminAction.UPDATE,
        entityType: EntityType.PRODUCT,
        entityId: updatedProduct.id,
        entityName: updatedProduct.name,
        changes,
      });
    }

    return updatedProduct;
  }

  async updateStatus(id: string, status: ProductStatus, userId: string, userName: string): Promise<Product> {
    const product = await this.findById(id);
    product.status = status;
    const updatedProduct = await this.productRepository.save(product);

    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.APPROVE,
      entityType: EntityType.PRODUCT,
      entityId: updatedProduct.id,
      entityName: updatedProduct.name,
      metadata: { status },
    });

    return updatedProduct;
  }

  async updateNav(productId: string, dto: UpdateNavDto, userId: string, userName: string): Promise<Product> {
    const product = await this.findById(productId);

    const valuationDate = new Date(dto.valuationDate);
    
    // Check if NAV already exists for this date
    const existingNav = await this.navHistoryRepository.findOne({
      where: { productId, valuationDate },
    });

    if (existingNav) {
      throw new ConflictException('NAV already exists for this valuation date');
    }

    // Calculate returns
    const latestNav = await this.navHistoryRepository.findOne({
      where: { productId },
      order: { valuationDate: 'DESC' },
    });

    const dailyReturn = latestNav
      ? ((dto.navPerShare - latestNav.navPerShare) / latestNav.navPerShare) * 100
      : 0;

    // Create NAV history record
    const navHistory = this.navHistoryRepository.create({
      productId,
      navPerShare: dto.navPerShare,
      totalAum: dto.totalAum,
      totalShares: dto.totalShares,
      valuationDate,
      previousNav: latestNav?.navPerShare || 0,
      dailyReturn,
      metadata: { notes: dto.notes },
    });

    await this.navHistoryRepository.save(navHistory);

    // Update product NAV
    product.navPerShare = dto.navPerShare;
    product.totalAum = dto.totalAum;
    product.totalShares = dto.totalShares;
    product.lastNavDate = valuationDate;
    product.highWaterMark = Math.max(product.highWaterMark, dto.navPerShare);

    const updatedProduct = await this.productRepository.save(product);

    // Log audit
    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.UPDATE,
      entityType: EntityType.PRODUCT,
      entityId: updatedProduct.id,
      entityName: updatedProduct.name,
      changes: {
        navPerShare: { old: product.navPerShare, new: dto.navPerShare },
        totalAum: { old: product.totalAum, new: dto.totalAum },
      },
    });

    return updatedProduct;
  }

  async getNavHistory(productId: string, startDate?: Date, endDate?: Date): Promise<NavHistory[]> {
    const queryBuilder = this.navHistoryRepository.createQueryBuilder('nav')
      .where('nav.productId = :productId', { productId });

    if (startDate) {
      queryBuilder.andWhere('nav.valuationDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('nav.valuationDate <= :endDate', { endDate });
    }

    queryBuilder.orderBy('nav.valuationDate', 'DESC');

    return await queryBuilder.getMany();
  }

  async softDelete(id: string, userId: string, userName: string): Promise<void> {
    const product = await this.findById(id);
    
    if (product.currentAum > 0) {
      throw new BadRequestException('Cannot delete product with active investments');
    }

    await this.productRepository.softRemove(product);

    await this.adminService.logAction({
      userId,
      userName,
      userRole: 'ADMIN',
      action: AdminAction.DELETE,
      entityType: EntityType.PRODUCT,
      entityId: product.id,
      entityName: product.name,
    });
  }

  async getProductsByFundManager(fundManagerId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { fundManagerId },
      order: { createdAt: 'DESC' },
    });
  }

  async calculatePerformanceMetrics(productId: string): Promise<any> {
    const navHistory = await this.navHistoryRepository.find({
      where: { productId },
      order: { valuationDate: 'ASC' },
    });

    if (navHistory.length === 0) {
      return { message: 'No NAV history available' };
    }

    const firstNav = navHistory[0];
    const lastNav = navHistory[navHistory.length - 1];

    const sinceInceptionReturn = ((lastNav.navPerShare - firstNav.navPerShare) / firstNav.navPerShare) * 100;
    
    // Calculate volatility (simplified)
    const returns = navHistory.slice(1).map((nav, index) => {
      const prevNav = navHistory[index];
      return ((nav.navPerShare - prevNav.navPerShare) / prevNav.navPerShare) * 100;
    });

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized

    // Calculate Sharpe Ratio (assuming risk-free rate of 2%)
    const riskFreeRate = 2;
    const annualizedReturn = avgReturn * 252;
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;

    // Calculate max drawdown
    let peak = firstNav.navPerShare;
    let maxDrawdown = 0;
    for (const nav of navHistory) {
      if (nav.navPerShare > peak) {
        peak = nav.navPerShare;
      }
      const drawdown = ((peak - nav.navPerShare) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      sinceInceptionReturn,
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      totalDataPoints: navHistory.length,
      inceptionDate: firstNav.valuationDate,
      latestNavDate: lastNav.valuationDate,
    };
  }
}
