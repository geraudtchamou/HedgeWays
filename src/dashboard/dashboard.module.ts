/**
 * Dashboard Module
 * NestJS module that provides dashboard functionality with role-based layouts and widgets.
 */

import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    // Import analytics module for metrics data
    // Import fees module for revenue data
    // Import funds module for AUM data
    // Import users module for user-specific data
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
