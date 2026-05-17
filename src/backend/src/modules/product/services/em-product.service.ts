import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, ILike } from 'typeorm';
import { EmProductDetails } from '../entities/em-product-details.entity';
import { Product } from '../entities/product.entity';
import { CreateEmProductDto, UpdateEmProductDto, EmProductFilterDto, EmProductSubType } from '../dto/em-product.dto';

@Injectable()
export class EmProductService {
  constructor(
    @InjectRepository(EmProductDetails)
    private readonly emProductRepository: Repository<EmProductDetails>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new emerging markets product
   */
  async create(createEmProductDto: CreateEmProductDto): Promise<EmProductDetails> {
    // First create the base product
    const baseProduct = this.productRepository.create({
      name: createEmProductDto.name,
      description: createEmProductDto.description,
      type: createEmProductDto.baseProductType,
      currency: createEmProductDto.currency,
      minimumInvestment: createEmProductDto.minimumInvestment,
      maximumInvestment: createEmProductDto.maximumInvestment,
      targetAum: createEmProductDto.targetAum,
      riskLevel: createEmProductDto.riskLevel,
      feeStructures: createEmProductDto.feeStructures,
      redemptionFrequency: createEmProductDto.redemptionFrequency,
      lockupPeriodDays: createEmProductDto.lockupPeriodDays,
      noticePeriodDays: createEmProductDto.noticePeriodDays,
      isAccreditedOnly: createEmProductDto.isAccreditedOnly,
      investmentStrategy: createEmProductDto.investmentStrategy,
      fundManagerId: createEmProductDto.fundManagerId,
      allowedCountries: createEmProductDto.allowedCountries,
      restrictedCountries: createEmProductDto.restrictedCountries,
      inceptionDate: createEmProductDto.inceptionDate ? new Date(createEmProductDto.inceptionDate) : undefined,
      fiscalYearEnd: createEmProductDto.fiscalYearEnd,
      status: 'PENDING_APPROVAL',
    });

    const savedBaseProduct = await this.productRepository.save(baseProduct);

    // Calculate asset allocation if not provided
    let assetAllocation = createEmProductDto.assetAllocation;
    if (!assetAllocation && createEmProductDto.emSubType) {
      assetAllocation = this.getDefaultAssetAllocation(createEmProductDto.emSubType);
    }

    // Create EM-specific details
    const emProduct = this.emProductRepository.create({
      productId: savedBaseProduct.id,
      baseProductType: createEmProductDto.baseProductType,
      emSubType: createEmProductDto.emSubType,
      targetRegion: createEmProductDto.targetRegion,
      targetCountries: createEmProductDto.targetCountries,
      
      // Commodity exposure
      commodityType: createEmProductDto.commodityExposure?.commodityType,
      specificCommodities: createEmProductDto.commodityExposure?.specificCommodities,
      isFuturesBased: createEmProductDto.commodityExposure?.isFuturesBased || false,
      rollFrequencyDays: createEmProductDto.commodityExposure?.rollFrequencyDays,
      
      // Equity exposure
      equityCountry: createEmProductDto.equityExposure?.country,
      equitySector: createEmProductDto.equityExposure?.sector,
      marketCapFocus: createEmProductDto.equityExposure?.marketCapFocus,
      investmentStyle: createEmProductDto.equityExposure?.style,
      dividendFocus: createEmProductDto.equityExposure?.dividendFocus || false,
      minDividendYield: createEmProductDto.equityExposure?.minDividendYield,
      
      // Bond exposure
      bondType: createEmProductDto.bondExposure?.bondType,
      bondCountry: createEmProductDto.bondExposure?.country,
      bondCurrency: createEmProductDto.bondExposure?.currency,
      creditRating: createEmProductDto.bondExposure?.creditRating,
      avgDuration: createEmProductDto.bondExposure?.avgDuration,
      avgYield: createEmProductDto.bondExposure?.avgYield,
      
      // Real estate exposure
      housingType: createEmProductDto.realEstateExposure?.housingType,
      propertyType: createEmProductDto.realEstateExposure?.propertyType,
      propertyCountry: createEmProductDto.realEstateExposure?.country,
      propertyCity: createEmProductDto.realEstateExposure?.city,
      targetOccupancyRate: createEmProductDto.realEstateExposure?.targetOccupancyRate,
      projectedRentalYield: createEmProductDto.realEstateExposure?.projectedRentalYield,
      isDevelopmentProject: createEmProductDto.realEstateExposure?.isDevelopmentProject || false,
      developmentTimelineMonths: createEmProductDto.realEstateExposure?.developmentTimelineMonths,
      
      // Manufacturing exposure
      manufacturingSector: createEmProductDto.manufacturingExposure?.sector,
      manufacturingCountry: createEmProductDto.manufacturingExposure?.country,
      manufacturingSubsector: createEmProductDto.manufacturingExposure?.subsector,
      productionCapacity: createEmProductDto.manufacturingExposure?.productionCapacity,
      capacityUtilization: createEmProductDto.manufacturingExposure?.capacityUtilization,
      isExportOriented: createEmProductDto.manufacturingExposure?.isExportOriented || false,
      exportMarkets: createEmProductDto.manufacturingExposure?.exportMarkets,
      
      // Mining exposure
      miningOperationType: createEmProductDto.miningExposure?.operationType,
      miningResourceType: createEmProductDto.miningExposure?.resourceType,
      specificResources: createEmProductDto.miningExposure?.specificResources,
      miningCountry: createEmProductDto.miningExposure?.country,
      reserveLifeYears: createEmProductDto.miningExposure?.reserveLifeYears,
      dailyProduction: createEmProductDto.miningExposure?.dailyProduction,
      allInSustainingCost: createEmProductDto.miningExposure?.allInSustainingCost,
      hasEnvironmentalPermits: createEmProductDto.miningExposure?.hasEnvironmentalPermits || false,
      
      // Crypto exposure
      cryptoCategory: createEmProductDto.cryptoExposure?.category,
      cryptoSpecificAssets: createEmProductDto.cryptoExposure?.specificAssets,
      isStakingEnabled: createEmProductDto.cryptoExposure?.isStakingEnabled || false,
      stakingYield: createEmProductDto.cryptoExposure?.stakingYield,
      isCustodied: createEmProductDto.cryptoExposure?.isCustodied || false,
      custodian: createEmProductDto.cryptoExposure?.custodian,
      cryptoUsesDerivatives: createEmProductDto.cryptoExposure?.usesDerivatives || false,
      
      // Asset allocation
      commoditiesAllocation: assetAllocation?.commoditiesAllocation,
      equitiesAllocation: assetAllocation?.equitiesAllocation,
      bondsAllocation: assetAllocation?.bondsAllocation,
      realEstateAllocation: assetAllocation?.realEstateAllocation,
      manufacturingAllocation: assetAllocation?.manufacturingAllocation,
      miningAllocation: assetAllocation?.miningAllocation,
      cryptoAllocation: assetAllocation?.cryptoAllocation,
      cashAllocation: assetAllocation?.cashAllocation,
      
      // ESG & compliance
      esgRating: createEmProductDto.esgRating,
      isShariaCompliant: createEmProductDto.isShariaCompliant || false,
      hasImpactInvestingFocus: createEmProductDto.hasImpactInvestingFocus || false,
      
      // Risk management
      maxSingleAssetExposure: createEmProductDto.maxSingleAssetExposure,
      maxCountryExposure: createEmProductDto.maxCountryExposure,
      currencyHedgingStrategy: createEmProductDto.usesCurrencyHedging ? 
        (createEmProductDto.commodityExposure?.currencyHedging || 'UNHEDGED') : undefined,
      usesCurrencyHedging: createEmProductDto.usesCurrencyHedging || false,
      usesDerivatives: createEmProductDto.usesDerivatives || false,
      
      // Metadata
      benchmarkIndices: createEmProductDto.benchmarkIndices,
      inceptionDate: createEmProductDto.inceptionDate ? new Date(createEmProductDto.inceptionDate) : undefined,
      fiscalYearEnd: createEmProductDto.fiscalYearEnd,
      documentUrls: createEmProductDto.documentUrls,
      
      status: 'DRAFT',
    });

    return await this.emProductRepository.save(emProduct);
  }

  /**
   * Find EM product by ID with base product details
   */
  async findById(id: string): Promise<EmProductDetails> {
    const emProduct = await this.emProductRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!emProduct) {
      throw new NotFoundException(`EM product with ID ${id} not found`);
    }

    return emProduct;
  }

  /**
   * Find all EM products with filtering and pagination
   */
  async findAll(filterDto: EmProductFilterDto) {
    const {
      baseProductType,
      emSubType,
      targetRegion,
      targetCountry,
      riskLevel,
      esgRating,
      currency,
      isAccreditedOnly,
      isShariaCompliant,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = filterDto;

    const where: any = {};

    if (baseProductType) {
      where.baseProductType = baseProductType;
    }

    if (emSubType) {
      where.emSubType = emSubType;
    }

    if (targetRegion) {
      where.targetRegion = targetRegion;
    }

    if (targetCountry) {
      where.targetCountries = Like(`%${targetCountry}%`);
    }

    if (riskLevel) {
      // Need to join with product table for riskLevel
      // This will be handled in the query builder below
    }

    if (esgRating) {
      where.esgRating = esgRating;
    }

    if (isShariaCompliant !== undefined) {
      where.isShariaCompliant = isShariaCompliant;
    }

    if (search) {
      // Search will be handled in query builder
    }

    const queryBuilder = this.emProductRepository
      .createQueryBuilder('em')
      .leftJoinAndSelect('em.product', 'product')
      .where(where);

    // Add risk level filter
    if (riskLevel) {
      queryBuilder.andWhere('product.riskLevel = :riskLevel', { riskLevel });
    }

    // Add currency filter
    if (currency) {
      queryBuilder.andWhere('product.currency = :currency', { currency });
    }

    // Add accredited only filter
    if (isAccreditedOnly !== undefined) {
      queryBuilder.andWhere('product.isAccreditedOnly = :isAccreditedOnly', { isAccreditedOnly });
    }

    // Add search
    if (search) {
      queryBuilder.andWhere(
        '(em.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Add ordering
    queryBuilder.orderBy(`em.${sortBy}`, sortOrder);

    // Add pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update EM product
   */
  async update(id: string, updateEmProductDto: UpdateEmProductDto): Promise<EmProductDetails> {
    const emProduct = await this.findById(id);

    // Update base product if needed
    if (updateEmProductDto.name || updateEmProductDto.description) {
      await this.productRepository.update(emProduct.productId, {
        name: updateEmProductDto.name,
        description: updateEmProductDto.description,
      });
    }

    // Update EM-specific fields
    Object.assign(emProduct, {
      riskLevel: updateEmProductDto.riskLevel,
      minimumInvestment: updateEmProductDto.minimumInvestment,
      maximumInvestment: updateEmProductDto.maximumInvestment,
      feeStructures: updateEmProductDto.feeStructures,
      redemptionFrequency: updateEmProductDto.redemptionFrequency,
      investmentStrategy: updateEmProductDto.investmentStrategy,
      esgRating: updateEmProductDto.esgRating,
      maxSingleAssetExposure: updateEmProductDto.maxSingleAssetExposure,
      maxCountryExposure: updateEmProductDto.maxCountryExposure,
    });

    // Update asset allocation if provided
    if (updateEmProductDto.assetAllocation) {
      Object.assign(emProduct, {
        commoditiesAllocation: updateEmProductDto.assetAllocation.commoditiesAllocation,
        equitiesAllocation: updateEmProductDto.assetAllocation.equitiesAllocation,
        bondsAllocation: updateEmProductDto.assetAllocation.bondsAllocation,
        realEstateAllocation: updateEmProductDto.assetAllocation.realEstateAllocation,
        manufacturingAllocation: updateEmProductDto.assetAllocation.manufacturingAllocation,
        miningAllocation: updateEmProductDto.assetAllocation.miningAllocation,
        cryptoAllocation: updateEmProductDto.assetAllocation.cryptoAllocation,
        cashAllocation: updateEmProductDto.assetAllocation.cashAllocation,
      });
    }

    return await this.emProductRepository.save(emProduct);
  }

  /**
   * Update EM product status
   */
  async updateStatus(id: string, status: string): Promise<EmProductDetails> {
    const emProduct = await this.findById(id);
    
    const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'LIQUIDATED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    emProduct.status = status;
    
    // Also update base product status
    await this.productRepository.update(emProduct.productId, { status: status as any });
    
    return await this.emProductRepository.save(emProduct);
  }

  /**
   * Delete EM product (soft delete via base product)
   */
  async delete(id: string): Promise<void> {
    const emProduct = await this.findById(id);
    
    // Delete base product (cascade will handle EM details)
    await this.productRepository.delete(emProduct.productId);
  }

  /**
   * Get EM products by region
   */
  async findByRegion(region: string): Promise<EmProductDetails[]> {
    return await this.emProductRepository.find({
      where: { targetRegion: region as any },
      relations: ['product'],
    });
  }

  /**
   * Get EM products by sub-type
   */
  async findBySubType(subType: EmProductSubType): Promise<EmProductDetails[]> {
    return await this.emProductRepository.find({
      where: { emSubType: subType },
      relations: ['product'],
    });
  }

  /**
   * Get EM products by country
   */
  async findByCountry(country: string): Promise<EmProductDetails[]> {
    return await this.emProductRepository.find({
      where: { targetCountries: Like(`%${country}%`) },
      relations: ['product'],
    });
  }

  /**
   * Validate asset allocation sums to 100%
   */
  validateAssetAllocation(allocation: any): boolean {
    const total = 
      (allocation.commoditiesAllocation || 0) +
      (allocation.equitiesAllocation || 0) +
      (allocation.bondsAllocation || 0) +
      (allocation.realEstateAllocation || 0) +
      (allocation.manufacturingAllocation || 0) +
      (allocation.miningAllocation || 0) +
      (allocation.cryptoAllocation || 0) +
      (allocation.cashAllocation || 0);
    
    // Allow small floating point errors
    return Math.abs(total - 100) < 0.01;
  }

  /**
   * Get default asset allocation based on product sub-type
   */
  private getDefaultAssetAllocation(subType: EmProductSubType): any {
    const allocations: Record<EmProductSubType, any> = {
      // Commodity products
      COMMODITY_INDEX: { commoditiesAllocation: 95, cashAllocation: 5 },
      COMMODITY_FUTURES: { commoditiesAllocation: 90, cashAllocation: 10 },
      COMMODITY_SPOT: { commoditiesAllocation: 98, cashAllocation: 2 },
      
      // Equity products
      EM_EQUITY_BROAD: { equitiesAllocation: 95, cashAllocation: 5 },
      EM_EQUITY_COUNTRY: { equitiesAllocation: 95, cashAllocation: 5 },
      EM_EQUITY_SECTOR: { equitiesAllocation: 95, cashAllocation: 5 },
      EM_EQUITY_DIVIDEND: { equitiesAllocation: 95, cashAllocation: 5 },
      EM_EQUITY_SMALL_CAP: { equitiesAllocation: 95, cashAllocation: 5 },
      
      // Bond products
      EM_BOND_SOVEREIGN_HARD: { bondsAllocation: 95, cashAllocation: 5 },
      EM_BOND_SOVEREIGN_LOCAL: { bondsAllocation: 95, cashAllocation: 5 },
      EM_BOND_CORPORATE: { bondsAllocation: 95, cashAllocation: 5 },
      EM_BOND_HIGH_YIELD: { bondsAllocation: 90, cashAllocation: 10 },
      EM_BOND_INVESTMENT_GRADE: { bondsAllocation: 95, cashAllocation: 5 },
      
      // Real estate products
      EM_REIT_RESIDENTIAL: { realEstateAllocation: 95, cashAllocation: 5 },
      EM_REIT_COMMERCIAL: { realEstateAllocation: 95, cashAllocation: 5 },
      EM_REIT_INDUSTRIAL: { realEstateAllocation: 95, cashAllocation: 5 },
      EM_HOUSING_DEVELOPMENT: { realEstateAllocation: 90, cashAllocation: 10 },
      EM_AFFORDABLE_HOUSING: { realEstateAllocation: 90, cashAllocation: 10 },
      
      // Manufacturing products
      EM_MANUFACTURING_INFRASTRUCTURE: { manufacturingAllocation: 90, cashAllocation: 10 },
      EM_MANUFACTURING_INDUSTRIAL: { manufacturingAllocation: 90, cashAllocation: 10 },
      EM_MANUFACTURING_TECH: { manufacturingAllocation: 90, cashAllocation: 10 },
      EM_MANUFACTURING_CONSUMER: { manufacturingAllocation: 90, cashAllocation: 10 },
      
      // Mining products
      EM_MINING_PRECIOUS_METALS: { miningAllocation: 90, cashAllocation: 10 },
      EM_MINING_BASE_METALS: { miningAllocation: 90, cashAllocation: 10 },
      EM_MINING_ENERGY: { miningAllocation: 90, cashAllocation: 10 },
      EM_MINING_RARE_EARTH: { miningAllocation: 90, cashAllocation: 10 },
      EM_MINING_DIVERSIFIED: { miningAllocation: 90, cashAllocation: 10 },
      
      // Crypto products
      EM_CRYPTO_BITCOIN: { cryptoAllocation: 95, cashAllocation: 5 },
      EM_CRYPTO_ETHER: { cryptoAllocation: 95, cashAllocation: 5 },
      EM_CRYPTO_ALTS: { cryptoAllocation: 90, cashAllocation: 10 },
      EM_CRYPTO_STAKING: { cryptoAllocation: 90, cashAllocation: 10 },
      EM_CRYPTO_DEFi: { cryptoAllocation: 90, cashAllocation: 10 },
      EM_CRYPTO_INDEX: { cryptoAllocation: 95, cashAllocation: 5 },
    };

    return allocations[subType] || { cashAllocation: 100 };
  }
}
