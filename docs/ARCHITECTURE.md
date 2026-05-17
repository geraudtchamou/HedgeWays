# Architecture Overview

## System Design

The Emerging Markets Investment Platform follows a **modular monolith** architecture with clear separation of concerns, designed for scalability and maintainability.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Web App   │  │  Mobile App │  │  Third-Party Integrations│  │
│  │  (React/TS) │  │  (Future)   │  │    (API Consumers)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS/REST
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Load Balancer / Reverse Proxy                │   │
│  │                    (Nginx / Traefik)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  FastAPI Backend                          │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │   Routes   │ │   Middle   │ │   Security │            │   │
│  │  │  (Controllers)│ │   ware     │ │   (JWT)    │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘            │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │              Service Layer (Business Logic)         │   │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │   │
│  │  │  │ Product  │ │   Fee    │ │  Token   │           │   │   │
│  │  │  │ Service  │ │ Service  │ │ Service  │           │   │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘           │   │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │   │
│  │  │  │Analytics │ │Dashboard │ │  Admin   │           │   │   │
│  │  │  │ Service  │ │ Service  │ │ Service  │           │   │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘           │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │              Data Access Layer                      │   │   │
│  │  │         (SQLAlchemy ORM + Repository Pattern)       │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   PostgreSQL     │ │     Redis        │ │  Blockchain      │
│   (Primary DB)   │ │    (Cache)       │ │    Node          │
│                  │ │                  │ │                  │
│ - Products       │ │ - Sessions       │ │ - Token Events   │
│ - Users          │ │ - Rate Limits    │ │ - Smart Contracts│
│ - Transactions   │ │ - Metrics        │ │                  │
│ - Tokens         │ │ - Queues         │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## Module Breakdown

### 1. Financial Products Module

**Purpose**: Manage investment products across 7 asset classes.

**Components**:
- `Product`: Core entity with asset class, country, currency
- `ProductHolding`: Individual holdings within a product
- `NAVCalculation`: Daily net asset value tracking
- `ESGRating`: Environmental, Social, Governance scores

**Key Features**:
- Multi-asset class support (Commodity, Stock, Bond, Real Estate, Manufacturing, Mining, Crypto)
- ESG rating integration
- Multi-currency support
- Country-specific regulations

**Database Tables**:
- `products`
- `product_holdings`
- `nav_history`
- `esg_ratings`

---

### 2. Fee & Revenue Management Module

**Purpose**: Calculate and track management fees, performance fees, and other revenues.

**Components**:
- `FeeStructure`: Defines fee calculation method
- `FeeAccrual`: Pending fee calculations
- `FeePayment`: Executed fee payments
- `HighWaterMark`: Tracks peak NAV for performance fees

**Fee Calculation Methods**:
1. **Flat**: Fixed amount
2. **AUM Percentage**: % of assets under management
3. **Performance**: % of profits with:
   - High Water Mark protection
   - Hurdle rate thresholds
4. **Tiered**: Variable rates based on investment size

**Database Tables**:
- `fee_structures`
- `fee_accruals`
- `fee_payments`
- `high_water_marks`

---

### 3. Analytics Module

**Purpose**: Track KPIs, metrics, and generate insights.

**Components**:
- `Metric`: Raw data points (NAV, AUM, flows)
- `KPI`: Calculated indicators (ROI, Sharpe, VaR)
- `Benchmark`: Comparison indices
- `Report`: Generated analytics reports

**KPI Categories**:
- **Performance**: ROI, CAGR, Alpha, Beta
- **Risk**: VaR, Sharpe Ratio, Max Drawdown, Volatility
- **Liquidity**: Turnover, Redemption coverage
- **ESG**: Carbon footprint, Social impact
- **Operational**: System metrics, Transaction latency

**Database Tables**:
- `metrics`
- `kpis`
- `benchmarks`
- `reports`

---

### 4. Dashboard Module

**Purpose**: Provide role-specific visualizations and data views.

**Components**:
- `DashboardLayout`: Pre-configured layouts per role
- `Widget`: Individual chart/metric components
- `ChartConfig`: Visualization settings
- `Export`: Data export functionality

**User Roles & Dashboards**:
- **Investor**: Portfolio value, Allocation, Performance
- **Analyst**: Market trends, Comparisons, Risk heatmaps
- **Fund Manager**: AUM overview, Fee accruals, Benchmarks
- **Admin**: User management, System health, Audit logs

**Chart Types Supported**:
- Line, Bar, Pie, Doughnut, Area
- Scatter, Candlestick, Heatmap
- Gauge, Table

**Database Tables**:
- `dashboard_layouts`
- `widgets`
- `chart_configs`
- `user_preferences`

---

### 5. Asset Tokenization Module

**Purpose**: Digitize real-world assets as blockchain tokens.

**Components**:
- `Token`: ERC-20 compatible token definition
- `InvestorWallet`: Investor wallet with KYC status
- `WalletHolding`: Token balance tracking
- `TokenTransaction`: Immutable transaction ledger
- `DividendDistribution`: Corporate action handler

**Key Features**:
- ERC-20 token creation
- KYC/AML compliance enforcement
- Lock-up period management
- Automated dividend distribution
- Blockchain event synchronization
- Complete audit trail

**Database Tables**:
- `tokens`
- `investor_wallets`
- `wallet_holdings`
- `token_transactions`
- `dividend_distributions`

---

### 6. Admin & RBAC Module

**Purpose**: Manage users, roles, permissions, and audit trails.

**Components**:
- `User`: User account information
- `Role`: Role definitions
- `Permission`: Granular permissions
- `AuditLog`: System action logging

**Pre-defined Roles**:
1. **Super Admin**: Full system access
2. **Fund Manager**: Product and token management
3. **Analyst**: Read-only analytics access
4. **Compliance Officer**: KYC/AML oversight
5. **Investor**: Portfolio viewing and transactions

**Permission Model**:
- Resource-based: PRODUCT, TOKEN, USER, FEE, ANALYTICS
- Action-based: CREATE, READ, UPDATE, DELETE
- Combined: `products:create`, `tokens:read`, etc.

**Database Tables**:
- `users`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `audit_logs`

---

## Data Flow Examples

### Creating a New Product

```
1. User (Fund Manager) → POST /api/v1/products
2. API Gateway → Validates JWT token
3. Products Route → Validates request schema (Pydantic)
4. ProductService → Business logic validation
   - Check unique name
   - Validate asset class
   - Verify country/currency
5. ProductRepository → Database insert
6. PostgreSQL → Persist product record
7. Response → Return created product with ID
8. AuditLog → Log "CREATE PRODUCT" action
```

### Token Transfer

```
1. User (Investor) → POST /api/v1/tokens/transfer
2. API Gateway → Validates JWT, checks rate limit
3. Tokenization Route → Validates transfer request
4. TokenizationService → Business logic
   - Verify KYC status (both wallets)
   - Check lock-up period
   - Validate sufficient balance
   - Calculate any transfer fees
5. WalletRepository → Update balances (atomic transaction)
6. TokenTransactionRepository → Record transaction
7. Blockchain Service → Emit event (if integrated)
8. AuditLog → Log "TOKEN TRANSFER" action
9. Response → Return transaction confirmation
```

### Fee Calculation (Scheduled)

```
1. Scheduler (Daily) → Trigger fee calculation
2. FeeService → Get all active products
3. For each product:
   a. Get period AUM (avg daily)
   b. Get period return %
   c. Apply fee structure:
      - Management fee = AUM × rate
      - Performance fee = max(0, return - hurdle) × rate
      - Check high water mark
   d. Create FeeAccrual record
4. PostgreSQL → Batch insert accruals
5. Notification Service → Alert fund managers
6. AuditLog → Log "FEE CALCULATION" batch
```

---

## Security Architecture

### Authentication Flow
```
1. User submits credentials → POST /auth/login
2. AuthService → Validate against hashed password (bcrypt)
3. Generate JWT → Sign with secret key
4. Return tokens → Access token (short-lived) + Refresh token
5. Client stores tokens → HttpOnly cookies or secure storage
6. Subsequent requests → Include JWT in Authorization header
7. Middleware → Validate JWT signature and expiration
8. Grant access → If valid, proceed with request
```

### Authorization Model
```
Request → Extract user from JWT → Get user roles → 
Get permissions → Check against required permission → 
Allow/Deny
```

### Data Protection
- **At Rest**: AES-256 encryption for sensitive fields
- **In Transit**: TLS 1.3 for all communications
- **Passwords**: bcrypt hashing with salt
- **Tokens**: JWT with RS256 asymmetric signing (production)

---

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Any instance can handle any request
- **Session Storage**: Redis for distributed session management
- **Database**: Read replicas for query scaling
- **Caching**: Multi-layer caching (Redis, CDN)

### Performance Optimizations
- **Async I/O**: FastAPI async endpoints
- **Connection Pooling**: SQLAlchemy async engine
- **Query Optimization**: Indexed columns, eager loading
- **Batch Operations**: Bulk inserts/updates where possible
- **Pagination**: Cursor-based pagination for large datasets

### Future Microservices Migration
The modular design allows easy extraction of services:
1. Tokenization Service → Separate blockchain-focused service
2. Analytics Service → Dedicated data processing pipeline
3. Notification Service → Event-driven messaging

---

## Technology Decisions

### Why FastAPI?
- High performance (Starlette + Pydantic)
- Automatic OpenAPI documentation
- Async support out of the box
- Type safety with Python type hints
- Easy dependency injection

### Why SQLAlchemy?
- Mature ORM with excellent async support
- Flexible query building
- Migration support via Alembic
- Database abstraction for portability

### Why React + TypeScript?
- Strong typing reduces runtime errors
- Large ecosystem and community
- Component reusability
- Excellent dev tools

### Why PostgreSQL?
- Robust ACID compliance
- Advanced features (JSONB, full-text search)
- Strong consistency for financial data
- Proven track record in fintech

---

## Monitoring & Observability

### Logging Strategy
- **Structured Logging**: JSON format for log aggregation
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Correlation IDs**: Track requests across services
- **Sensitive Data**: Automatically redacted

### Metrics Collection
- **Application Metrics**: Request latency, error rates
- **Business Metrics**: AUM, transaction volume, active users
- **Infrastructure Metrics**: CPU, memory, disk, network

### Alerting
- **Error Rate**: >1% of requests failing
- **Latency**: P95 > 500ms
- **System**: Disk >80%, Memory >90%
- **Business**: Failed transactions, KYC rejections

---

## Disaster Recovery

### Backup Strategy
- **Database**: Continuous WAL archiving + daily full backups
- **Files**: S3 versioning for uploaded documents
- **Configuration**: Infrastructure as Code (Terraform)

### Recovery Objectives
- **RTO (Recovery Time Objective)**: < 4 hours
- **RPO (Recovery Point Objective)**: < 15 minutes

### Failover Plan
1. Detect failure (monitoring alerts)
2. Switch to standby database (automated)
3. Redirect traffic to healthy region (DNS failover)
4. Notify stakeholders
5. Post-incident review
