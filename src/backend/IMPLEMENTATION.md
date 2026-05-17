# Investment Platform - Backend Implementation

## Overview

This document describes the backend implementation for the institutional-grade investment management platform, focusing on efficient user management, admin operations, and financial product management.

## Architecture

### Technology Stack
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with TimescaleDB
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/                 # Configuration files
│   └── database.config.ts
├── common/                 # Shared utilities
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── permissions.decorator.ts
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── auth/                   # Authentication module
│   ├── decorators/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.guard.ts
│   └── strategies/
└── modules/                # Feature modules
    ├── user/               # User management
    │   ├── dto/
    │   ├── entities/
    │   ├── services/
    │   ├── controllers/
    │   └── user.module.ts
    ├── admin/              # Admin & audit logging
    │   ├── dto/
    │   ├── entities/
    │   ├── services/
    │   ├── controllers/
    │   └── admin.module.ts
    ├── product/            # Financial products
    │   ├── dto/
    │   ├── entities/
    │   ├── services/
    │   ├── controllers/
    │   └── product.module.ts
    ├── fee-revenue/        # Fee & revenue management
    │   ├── dto/
    │   ├── entities/
    │   ├── services/
    │   ├── controllers/
    │   └── fee-revenue.module.ts
    ├── wallet/             # Wallet system
    ├── ledger/             # Double-entry ledger
    ├── subscription/       # Investment subscriptions
    └── kyc/                # KYC/AML compliance
```

## Core Modules

### 1. User Management Module

#### Features
- Individual and corporate investor registration
- Role-based access control (10 user roles)
- Permission-based authorization
- Profile management
- Email verification
- MFA support
- Referral system
- Account lockout protection

#### User Roles
1. `INDIVIDUAL_INVESTOR` - Retail investors
2. `CORPORATE_INVESTOR` - Corporate entities
3. `FUND_MANAGER` - Fund management professionals
4. `ANGEL_INVESTOR` - Angel investors
5. `SYNDICATE_LEAD` - Syndicate leaders
6. `STARTUP_FOUNDER` - Startup founders
7. `COMPLIANCE_OFFICER` - Compliance reviewers
8. `ANALYST` - Financial analysts
9. `ADMIN` - Platform administrators
10. `SUPER_ADMIN` - System super administrators

#### Key Entities
- **User**: Complete user profile with authentication, KYC status, accreditation
- **Profile**: Extended user information
- **AuditLog**: All user actions tracked

#### API Endpoints
```
POST   /users/register/individual    - Register individual investor
POST   /users/register/corporate     - Register corporate investor
GET    /users/me                     - Get current user profile
PUT    /users/me                     - Update current user profile
GET    /users                        - List all users (Admin)
GET    /users/:id                    - Get user by ID (Admin)
PUT    /users/:id                    - Update user (Admin)
DELETE /users/:id                    - Soft delete user (Super Admin)
POST   /users/:id/restore            - Restore deleted user
GET    /users/:id/referral-code      - Get/generate referral code
```

### 2. Admin Module

#### Features
- Comprehensive audit logging
- Dashboard statistics
- Compliance reporting
- Activity monitoring
- Entity-level change tracking

#### Audit Log Capabilities
- Track all CRUD operations
- Record before/after values
- IP address and user agent logging
- Searchable by entity, action, date range
- Compliance report generation

#### Key Entities
- **AuditLog**: Immutable audit trail

#### Admin Actions Tracked
- CREATE, UPDATE, DELETE, VIEW
- APPROVE, REJECT
- EXPORT, IMPORT
- LOGIN, LOGOUT
- PASSWORD_CHANGE
- ROLE_ASSIGNMENT, PERMISSION_CHANGE
- KYC_REVIEW
- SUBSCRIPTION_APPROVE
- WITHDRAWAL_APPROVE
- DISTRIBUTION_APPROVE

### 3. Product Management Module

#### Product Types Supported
- Hedge Funds
- Mutual Funds
- ETFs
- Private Equity
- Real Estate Funds
- Commodity Funds
- Crypto Funds
- Angel Syndicates
- SPVs (Special Purpose Vehicles)
- Trust Funds
- Structured Products

#### Product Features
- Flexible fee structures (management, performance, entry, exit)
- High-water mark calculations
- Hurdle rate support
- Lock-up periods
- Redemption frequency settings
- NAV tracking and history
- Performance metrics calculation
- Multi-currency support
- Country restrictions

#### Key Entities
- **Product**: Investment product definition
- **NavHistory**: Historical NAV records with returns

#### Fee Structure
```typescript
{
  type: 'MANAGEMENT' | 'PERFORMANCE' | 'ENTRY' | 'EXIT' | 'ADMINISTRATION',
  percentage: number,      // 0-100
  minimumAmount?: number,
  maximumAmount?: number,
  isHighWaterMark?: boolean,
  hurdleRate?: number
}
```

#### Performance Metrics
- Since inception return
- Annualized return
- Volatility (annualized)
- Sharpe ratio
- Maximum drawdown
- MTD, QTD, YTD returns

#### API Endpoints
```
POST   /products                    - Create product
GET    /products                    - List products
GET    /products/:id                - Get product details
PUT    /products/:id                - Update product
PUT    /products/:id/status         - Update product status
PUT    /products/:id/nav            - Update NAV
GET    /products/:id/nav-history    - Get NAV history
GET    /products/:id/performance    - Get performance metrics
DELETE /products/:id                - Delete product
GET    /products/fund-manager/:id   - Get products by manager
```

### 4. Fee & Revenue Management Module

#### Fee Categories
- Management Fees
- Performance Fees
- Entry/Exit Loads
- Administration Fees
- Custody Fees
- Audit & Legal Fees
- Transaction Fees

#### Fee Calculation Methods
- Percentage of AUM
- Percentage of NAV growth
- Flat amount
- Tiered percentage
- Hurdle rate based
- High water mark based

#### Accrual Frequencies
- Daily, Weekly, Monthly
- Quarterly, Annual
- On transaction

#### Payment Status Workflow
- PENDING → ACCRUED → INVOICED → PAID
- WAIVED, DEFERRED options

#### Revenue Recognition
- Fee income recognition
- Interest income
- Dividend income
- Capital gains
- Other income types

#### Key Entities
- **FeeStructure**: Fee configuration per product
- **FeeAccrual**: Accrued fees awaiting payment
- **FeePayment**: Processed fee payments
- **RevenueRecognition**: Recognized revenue entries

#### API Endpoints
```
POST   /fee-revenue/structures                      - Create fee structure
GET    /fee-revenue/structures/:id                  - Get fee structure
GET    /fee-revenue/products/:productId/structures  - Get product fee structures
PUT    /fee-revenue/structures/:id                  - Update fee structure
DELETE /fee-revenue/structures/:id                  - Deactivate fee structure
POST   /fee-revenue/calculate                       - Calculate fee
POST   /fee-revenue/accruals                        - Create accrual
POST   /fee-revenue/products/:productId/process-accruals - Process accruals
GET    /fee-revenue/accruals                        - Get accruals
POST   /fee-revenue/payments                        - Process payment
GET    /fee-revenue/payments                        - Get payments
POST   /fee-revenue/revenue                         - Recognize revenue
GET    /fee-revenue/revenue                         - Get revenue recognitions
GET    /fee-revenue/reports/fees                    - Fee report
GET    /fee-revenue/reports/products/:id/revenue-summary - Revenue summary
```

## Security Implementation

### Authentication
- JWT-based authentication
- Refresh token support
- MFA with TOTP
- Session management
- Device fingerprinting

### Authorization
- Role-based access control (RBAC)
- Permission-based access control (PBAC)
- Resource-level permissions
- Wildcard permission support (`*:*`, `products:*`)

### Default Permissions by Role

| Role | Permissions |
|------|-------------|
| SUPER_ADMIN | `*:*` (all) |
| ADMIN | users:read/update, products:*, subscriptions:*, kyc:review, reports:*, audit:read |
| COMPLIANCE_OFFICER | kyc:read/review/approve/reject, users:read, audit:read, reports:read |
| FUND_MANAGER | products:read/create/update, portfolio:read/manage, investors:read, reports:* |
| ANALYST | products:read, portfolio:read, analytics:read, reports:read |
| INDIVIDUAL_INVESTOR | profile:*, wallet:read, products:read, subscriptions:read/create, portfolio:read |

## Database Design

### Key Tables

#### users
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- firstName, lastName
- role (ENUM)
- status (ENUM)
- kycStatus (ENUM)
- accreditationStatus (ENUM)
- emailVerified, phoneVerified
- mfaEnabled, mfaSecret
- permissions (JSONB)
- lastLoginAt, lastLoginIp
- loginAttempts, lockedUntil
- createdAt, updatedAt, deletedAt
```

#### products
```sql
- id (UUID, PK)
- name (VARCHAR, UNIQUE)
- description (TEXT)
- type (ENUM)
- status (ENUM)
- currency (CHAR(3))
- minimumInvestment (DECIMAL)
- currentAum (DECIMAL)
- riskLevel (ENUM)
- feeStructures (JSONB)
- redemptionFrequency (ENUM)
- lockupPeriodDays (INTEGER)
- navPerShare (DECIMAL)
- totalShares (DECIMAL)
- highWaterMark (DECIMAL)
- createdAt, updatedAt, deletedAt
```

#### nav_history
```sql
- id (UUID, PK)
- productId (UUID, FK)
- navPerShare (DECIMAL)
- totalAum (DECIMAL)
- totalShares (DECIMAL)
- valuationDate (DATE)
- dailyReturn, mtdReturn, qtdReturn, ytdReturn
- createdAt
```

#### audit_logs
```sql
- id (UUID, PK)
- userId (UUID)
- userName, userRole
- action (ENUM)
- entityType (ENUM)
- entityId (UUID)
- entityName
- changes (JSONB)
- ipAddress, userAgent
- createdAt
```

## Performance Optimizations

### Database
- Strategic indexing on frequently queried columns
- Composite indexes for multi-column filters
- Soft delete with partial indexes
- Connection pooling (20 connections default)
- Query timeout limits (30s)

### Caching Strategy
- Redis for session storage
- Query result caching for static data
- NAV caching with invalidation
- User permission caching

### API Optimization
- Pagination on all list endpoints
- Selective field projection
- Eager/lazy loading configuration
- Request validation at boundary

## Error Handling

### Standard Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Exception Filters
- HTTP exception filter
- Validation exception filter
- Query failed exception filter
- Unauthorized exception filter

## Testing Strategy

### Unit Tests
- Service layer tests
- DTO validation tests
- Guard tests

### Integration Tests
- API endpoint tests
- Database integration tests
- Authentication flow tests

### E2E Tests
- User registration flow
- Product creation flow
- Subscription workflow

## Deployment

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=investment_platform
DB_POOL_SIZE=20

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d
REFRESH_TOKEN_EXPIRATION=7d

# Application
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1
```

### Docker Configuration
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

## Next Steps

1. **Wallet Module** - Implement multi-currency wallets
2. **Ledger Module** - Double-entry accounting system
3. **Subscription Module** - Investment subscription workflows
4. **KYC Module** - Identity verification integration
5. **Reporting Module** - Statement generation
6. **Notification Module** - Email/SMS/Push notifications

## API Documentation

Swagger documentation available at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://api.platform.com/docs`
