import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { NavHistory } from './entities/nav-history.entity';
import { EmProductDetails } from './entities/em-product-details.entity';
import { ProductService } from './services/product.service';
import { EmProductService } from './services/em-product.service';
import { ProductController } from './controllers/product.controller';
import { EmProductController } from './controllers/em-product.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, NavHistory, EmProductDetails]),
    AdminModule,
  ],
  providers: [ProductService, EmProductService],
  controllers: [ProductController, EmProductController],
  exports: [ProductService, EmProductService, TypeOrmModule],
})
export class ProductModule {}
