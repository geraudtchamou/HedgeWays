import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AdminService } from './services/admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
