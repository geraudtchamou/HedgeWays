import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmProductService } from '../services/em-product.service';
import { CreateEmProductDto, UpdateEmProductDto, EmProductFilterDto } from '../dto/em-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Emerging Markets Products')
@Controller('em-products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmProductController {
  constructor(private readonly emProductService: EmProductService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER')
  @ApiOperation({ summary: 'Create a new emerging markets product' })
  @ApiResponse({ status: 201, description: 'EM product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() createEmProductDto: CreateEmProductDto) {
    return await this.emProductService.create(createEmProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all EM products with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of EM products' })
  @ApiQuery({ name: 'baseProductType', required: false, enum: ['HEDGE_FUND', 'MUTUAL_FUND', 'ETF', 'PRIVATE_EQUITY', 'REAL_ESTATE', 'COMMODITY', 'CRYPTO_FUND'] })
  @ApiQuery({ name: 'emSubType', required: false, description: 'EM product sub-type' })
  @ApiQuery({ name: 'targetRegion', required: false, description: 'Target region (ASIA_PACIFIC, LATIN_AMERICA, EMEA, etc.)' })
  @ApiQuery({ name: 'targetCountry', required: false, description: 'Target country' })
  @ApiQuery({ name: 'riskLevel', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] })
  @ApiQuery({ name: 'esgRating', required: false, enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'NOT_RATED'] })
  @ApiQuery({ name: 'currency', required: false })
  @ApiQuery({ name: 'isAccreditedOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'isShariaCompliant', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() filterDto: EmProductFilterDto) {
    return await this.emProductService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EM product by ID' })
  @ApiResponse({ status: 200, description: 'EM product details' })
  @ApiResponse({ status: 404, description: 'EM product not found' })
  async findOne(@Param('id') id: string) {
    return await this.emProductService.findById(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'FUND_MANAGER')
  @ApiOperation({ summary: 'Update an existing EM product' })
  @ApiResponse({ status: 200, description: 'EM product updated successfully' })
  @ApiResponse({ status: 404, description: 'EM product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEmProductDto: UpdateEmProductDto,
  ) {
    return await this.emProductService.update(id, updateEmProductDto);
  }

  @Put(':id/status')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update EM product status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return await this.emProductService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete an EM product' })
  @ApiResponse({ status: 200, description: 'EM product deleted successfully' })
  @ApiResponse({ status: 404, description: 'EM product not found' })
  async delete(@Param('id') id: string) {
    await this.emProductService.delete(id);
    return { message: 'EM product deleted successfully' };
  }

  @Get('region/:region')
  @ApiOperation({ summary: 'Get EM products by region' })
  @ApiResponse({ status: 200, description: 'List of EM products in the region' })
  async findByRegion(@Param('region') region: string) {
    return await this.emProductService.findByRegion(region);
  }

  @Get('subtype/:subType')
  @ApiOperation({ summary: 'Get EM products by sub-type' })
  @ApiResponse({ status: 200, description: 'List of EM products with the sub-type' })
  async findBySubType(@Param('subType') subType: string) {
    return await this.emProductService.findBySubType(subType as any);
  }

  @Get('country/:country')
  @ApiOperation({ summary: 'Get EM products by country' })
  @ApiResponse({ status: 200, description: 'List of EM products targeting the country' })
  async findByCountry(@Param('country') country: string) {
    return await this.emProductService.findByCountry(country);
  }
}
