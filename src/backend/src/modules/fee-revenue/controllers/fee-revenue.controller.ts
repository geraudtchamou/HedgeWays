import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FeeRevenueService } from '../services/fee-revenue.service';
import { 
  CreateFeeStructureDto, 
  UpdateFeeStructureDto, 
  CalculateFeeDto, 
  FeeAccrualDto, 
  ProcessFeePaymentDto,
  RevenueRecognitionDto,
  FeeReportFilterDto,
} from '../dto/fee-revenue.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('fee-revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeeRevenueController {
  constructor(private readonly feeRevenueService: FeeRevenueService) {}

  // ==================== Fee Structure Endpoints ====================

  @Post('structures')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER')
  @Permissions('fee-structure:create')
  async createFeeStructure(@Body() dto: CreateFeeStructureDto, @Request() req: any) {
    return this.feeRevenueService.createFeeStructure(dto, req.user.id, req.user.name);
  }

  @Get('structures/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER', 'ANALYST')
  @Permissions('fee-structure:read')
  async getFeeStructure(@Param('id') id: string) {
    return this.feeRevenueService.getFeeStructure(id);
  }

  @Get('products/:productId/structures')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER', 'ANALYST')
  @Permissions('fee-structure:read')
  async getFeeStructuresByProduct(
    @Param('productId') productId: string,
    @Query('includeInactive') includeInactive: string = 'false',
  ) {
    return this.feeRevenueService.getFeeStructuresByProduct(productId, includeInactive === 'true');
  }

  @Put('structures/:id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER')
  @Permissions('fee-structure:update')
  async updateFeeStructure(
    @Param('id') id: string,
    @Body() dto: UpdateFeeStructureDto,
    @Request() req: any,
  ) {
    return this.feeRevenueService.updateFeeStructure(id, dto, req.user.id, req.user.name);
  }

  @Delete('structures/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permissions('fee-structure:delete')
  async deactivateFeeStructure(@Param('id') id: string, @Request() req: any) {
    await this.feeRevenueService.deactivateFeeStructure(id, req.user.id, req.user.name);
    return { message: 'Fee structure deactivated successfully' };
  }

  // ==================== Fee Calculation Endpoints ====================

  @Post('calculate')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER', 'ANALYST')
  @Permissions('fee:calculate')
  async calculateFee(@Body() dto: CalculateFeeDto) {
    return this.feeRevenueService.calculateFee(dto);
  }

  // ==================== Fee Accrual Endpoints ====================

  @Post('accruals')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER')
  @Permissions('fee-accrual:create')
  async createAccrual(@Body() dto: FeeAccrualDto, @Request() req: any) {
    return this.feeRevenueService.createAccrual(dto, req.user.id, req.user.name);
  }

  @Post('products/:productId/process-accruals')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER')
  @Permissions('fee-accrual:create')
  async processAccrualsForProduct(
    @Param('productId') productId: string,
    @Query('date') dateStr: string,
    @Request() req: any,
  ) {
    const calculationDate = dateStr ? new Date(dateStr) : new Date();
    return this.feeRevenueService.processAccrualsForProduct(productId, calculationDate, req.user.id, req.user.name);
  }

  @Get('accruals')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER', 'ANALYST')
  @Permissions('fee-accrual:read')
  async getAccruals(
    @Query('productId') productId?: string,
    @Query('investorId') investorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (productId) filters.productId = productId;
    if (investorId) filters.investorId = investorId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.feeRevenueService.getAccruals(filters);
  }

  // ==================== Fee Payment Endpoints ====================

  @Post('payments')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER')
  @Permissions('fee-payment:create')
  async processPayment(@Body() dto: ProcessFeePaymentDto, @Request() req: any) {
    return this.feeRevenueService.processPayment(dto, req.user.id, req.user.name);
  }

  @Get('payments')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER', 'ANALYST')
  @Permissions('fee-payment:read')
  async getPayments(
    @Query('productId') productId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (productId) filters.productId = productId;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.feeRevenueService.getPayments(filters);
  }

  // ==================== Revenue Recognition Endpoints ====================

  @Post('revenue')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER')
  @Permissions('revenue:create')
  async recognizeRevenue(@Body() dto: RevenueRecognitionDto, @Request() req: any) {
    return this.feeRevenueService.recognizeRevenue(dto, req.user.id, req.user.name);
  }

  @Get('revenue')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER', 'ANALYST')
  @Permissions('revenue:read')
  async getRevenueRecognitions(
    @Query('productId') productId?: string,
    @Query('revenueType') revenueType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (productId) filters.productId = productId;
    if (revenueType) filters.revenueType = revenueType;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.feeRevenueService.getRevenueRecognitions(filters);
  }

  // ==================== Reporting Endpoints ====================

  @Get('reports/fees')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER', 'ANALYST')
  @Permissions('report:read')
  async getFeeReport(
    @Query('productId') productId?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: FeeReportFilterDto = {};
    if (productId) filters.productId = productId;
    if (category) filters.category = category as any;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.feeRevenueService.getFeeReport(filters);
  }

  @Get('reports/products/:productId/revenue-summary')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER', 'ANALYST')
  @Permissions('report:read')
  async getProductRevenueSummary(
    @Param('productId') productId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.feeRevenueService.getProductRevenueSummary(
      productId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
