import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
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
import { UserService } from './services/user.service';
import {
  CreateIndividualUserDto,
  CreateCorporateUserDto,
  UpdateUserDto,
  UpdateAdminUserDto,
  UserFilterDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { UserRole } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register/individual')
  @ApiOperation({ summary: 'Register individual investor' })
  @HttpCode(HttpStatus.CREATED)
  async registerIndividual(@Body() dto: CreateIndividualUserDto) {
    const user = await this.userService.createIndividualUser(dto);
    return {
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
      email: user.email,
    };
  }

  @Post('register/corporate')
  @ApiOperation({ summary: 'Register corporate investor' })
  @HttpCode(HttpStatus.CREATED)
  async registerCorporate(@Body() dto: CreateCorporateUserDto) {
    const user = await this.userService.createCorporateUser(dto);
    return {
      message: 'Registration successful. Please verify your email and complete KYC.',
      userId: user.id,
      email: user.email,
      companyName: user.companyName,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req) {
    const user = await this.userService.findById(req.user.userId);
    const { password, mfaSecret, ...result } = user;
    return result;
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    const user = await this.userService.update(req.user.userId, dto);
    const { password, mfaSecret, ...result } = user;
    return result;
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER)
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() filters: UserFilterDto) {
    return await this.userService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COMPLIANCE_OFFICER)
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findById(id);
    const { password, mfaSecret, ...result } = user;
    return result;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('users:update')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminUserDto) {
    const user = await this.userService.updateByAdmin(id, dto);
    const { password, mfaSecret, ...result } = user;
    return result;
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('users:delete')
  @ApiOperation({ summary: 'Soft delete user (Super Admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('users:delete')
  @ApiOperation({ summary: 'Restore deleted user (Super Admin only)' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.restore(id);
    const { password, mfaSecret, ...result } = user;
    return result;
  }

  @Get(':id/referral-code')
  @ApiOperation({ summary: 'Get or generate referral code' })
  async getReferralCode(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    // Users can only get their own referral code unless admin
    if (req.user.userId !== id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      throw new Error('Unauthorized');
    }
    const code = await this.userService.generateReferralCode(id);
    return { referralCode: code };
  }
}
