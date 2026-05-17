import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './services/product.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto, UpdateNavDto, ProductStatus } from '../dto/product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { UserRole } from '../dto/product.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FUND_MANAGER)
  @Permissions('products:create')
  @ApiOperation({ summary: 'Create new investment product' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto, @Request() req) {
    const product = await this.productService.create(dto, req.user.userId, req.user.userName);
    return { message: 'Product created successfully', product };
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'riskLevel', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() filters: ProductFilterDto) {
    return await this.productService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FUND_MANAGER)
  @Permissions('products:update')
  @ApiOperation({ summary: 'Update product' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto, @Request() req) {
    const product = await this.productService.update(id, dto, req.user.userId, req.user.userName);
    return { message: 'Product updated successfully', product };
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('products:update')
  @ApiOperation({ summary: 'Update product status' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ProductStatus,
    @Request() req,
  ) {
    const product = await this.productService.updateStatus(id, status, req.user.userId, req.user.userName);
    return { message: 'Product status updated successfully', product };
  }

  @Put(':id/nav')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FUND_MANAGER, UserRole.ANALYST)
  @Permissions('products:update')
  @ApiOperation({ summary: 'Update NAV for product' })
  async updateNav(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNavDto, @Request() req) {
    const product = await this.productService.updateNav(id, dto, req.user.userId, req.user.userName);
    return { message: 'NAV updated successfully', product };
  }

  @Get(':id/nav-history')
  @ApiOperation({ summary: 'Get NAV history for product' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getNavHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.productService.getNavHistory(id, start, end);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get performance metrics for product' })
  async getPerformanceMetrics(@Param('id', ParseUUIDPipe) id: string) {
    return await this.productService.calculatePerformanceMetrics(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('products:delete')
  @ApiOperation({ summary: 'Delete product' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.productService.softDelete(id, req.user.userId, req.user.userName);
  }

  @Get('fund-manager/:fundManagerId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FUND_MANAGER)
  @ApiOperation({ summary: 'Get products by fund manager' })
  async getByFundManager(@Param('fundManagerId', ParseUUIDPipe) fundManagerId: string) {
    return await this.productService.getProductsByFundManager(fundManagerId);
  }
}
