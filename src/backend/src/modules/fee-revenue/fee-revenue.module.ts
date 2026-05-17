import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeRevenueController } from './controllers/fee-revenue.controller';
import { FeeRevenueService } from './services/fee-revenue.service';
import { FeeStructure, FeeAccrual, FeePayment, RevenueRecognition } from './entities/fee-structure.entity';
import { ProductModule } from '../product/product.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeeStructure, FeeAccrual, FeePayment, RevenueRecognition]),
    ProductModule,
    AdminModule,
  ],
  controllers: [FeeRevenueController],
  providers: [FeeRevenueService],
  exports: [FeeRevenueService],
})
export class FeeRevenueModule {}
