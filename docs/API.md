# API Documentation

## Base URL
`http://localhost:8000/api/v1`

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### POST /auth/login
Authenticate user and receive tokens.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Financial Products

### GET /products
List all financial products with optional filtering.

**Query Parameters:**
- `asset_class`: Filter by asset class (COMMODITY, STOCK, BOND, REAL_ESTATE, MANUFACTURING, MINING, CRYPTO)
- `country`: Filter by country code
- `currency`: Filter by currency
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "items": [
    {
      "id": "prod_123",
      "name": "Brazil Commodity Fund",
      "asset_class": "COMMODITY",
      "country": "BR",
      "currency": "USD",
      "aum": 50000000,
      "nav": 125.50,
      "esg_rating": "A",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### POST /products
Create a new financial product.

**Permissions:** Fund Manager, Admin

**Request:**
```json
{
  "name": "India Tech Equity Fund",
  "asset_class": "STOCK",
  "description": "Focused on Indian technology sector",
  "country": "IN",
  "currency": "USD",
  "initial_capital": 10000000,
  "management_fee": 1.5,
  "performance_fee": 20.0,
  "hurdle_rate": 8.0,
  "lock_up_period_days": 90
}
```

### GET /products/{product_id}
Get detailed information about a specific product.

**Response:**
```json
{
  "id": "prod_123",
  "name": "Brazil Commodity Fund",
  "asset_class": "COMMODITY",
  "description": "Diversified commodity exposure in Brazil",
  "country": "BR",
  "currency": "USD",
  "aum": 50000000,
  "nav": 125.50,
  "nav_date": "2024-01-20",
  "ytd_return": 12.5,
  "sharpe_ratio": 1.8,
  "max_drawdown": -8.2,
  "esg_rating": "A",
  "holdings": [...],
  "fees": {...},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T16:00:00Z"
}
```

---

## Fee Management

### POST /fees/calculate
Calculate fees for a given period.

**Request:**
```json
{
  "product_id": "prod_123",
  "calculation_date": "2024-01-31",
  "method": "PERFORMANCE" 
}
```

**Response:**
```json
{
  "product_id": "prod_123",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "aum_avg": 52000000,
  "return_pct": 5.2,
  "management_fee": 65000,
  "performance_fee": 416000,
  "total_fee": 481000,
  "high_water_mark": 130.25,
  "calculation_method": "PERFORMANCE"
}
```

### GET /fees/accruals
Get pending fee accruals.

**Query Parameters:**
- `product_id`: Filter by product
- `status`: PENDING, CALCULATED, PAID

---

## Analytics

### GET /analytics/kpis
Retrieve KPI data for dashboards.

**Query Parameters:**
- `product_id`: Optional filter
- `category`: PERFORMANCE, RISK, LIQUIDITY, ESG, OPERATIONAL
- `start_date`: Start of period
- `end_date`: End of period

**Response:**
```json
{
  "kpis": [
    {
      "name": "ROI",
      "value": 12.5,
      "unit": "PERCENT",
      "status": "POSITIVE",
      "benchmark": 8.0,
      "vs_benchmark": 4.5
    },
    {
      "name": "Sharpe Ratio",
      "value": 1.8,
      "unit": "RATIO",
      "status": "GOOD",
      "benchmark": 1.0,
      "vs_benchmark": 0.8
    }
  ],
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  }
}
```

### GET /analytics/metrics
Get raw metric data for custom charts.

**Query Parameters:**
- `metric_type`: NAV, AUM, FLOWS, RETURNS
- `granularity`: DAILY, WEEKLY, MONTHLY
- `product_id`: Optional filter

---

## Asset Tokenization

### POST /tokens
Create a new tokenized asset.

**Permissions:** Fund Manager, Admin

**Request:**
```json
{
  "product_id": "prod_123",
  "token_name": "Brazil Commodities Token",
  "token_symbol": "BRCOM",
  "total_supply": 1000000,
  "decimals": 18,
  "token_type": "ERC20",
  "lock_up_period_days": 90
}
```

**Response:**
```json
{
  "token_id": "tok_456",
  "product_id": "prod_123",
  "token_name": "Brazil Commodities Token",
  "token_symbol": "BRCOM",
  "contract_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "total_supply": 1000000,
  "circulating_supply": 0,
  "status": "ACTIVE",
  "blockchain_hash": "0xabc123...",
  "created_at": "2024-01-20T10:00:00Z"
}
```

### POST /tokens/transfer
Transfer tokens between wallets.

**Request:**
```json
{
  "token_id": "tok_456",
  "from_wallet_id": "wallet_1",
  "to_wallet_id": "wallet_2",
  "amount": 1000,
  "notes": "Investment purchase"
}
```

### POST /tokens/dividends
Distribute dividends to token holders.

**Request:**
```json
{
  "token_id": "tok_456",
  "dividend_per_token": 0.50,
  "currency": "USD",
  "distribution_date": "2024-03-31"
}
```

### GET /tokens/{token_id}/holders
Get list of token holders.

**Response:**
```json
{
  "token_id": "tok_456",
  "total_holders": 150,
  "holders": [
    {
      "wallet_id": "wallet_1",
      "investor_name": "John Doe",
      "balance": 5000,
      "percentage": 0.5,
      "kyc_status": "VERIFIED"
    }
  ]
}
```

---

## Admin & User Management

### GET /admin/users
List all users in the system.

**Query Parameters:**
- `role`: Filter by role
- `status`: ACTIVE, INACTIVE, SUSPENDED
- `search`: Search by name or email

### PUT /admin/users/{user_id}/role
Update user role.

**Permissions:** Super Admin only

**Request:**
```json
{
  "role": "FUND_MANAGER",
  "permissions": ["products:create", "products:update", "tokens:create"]
}
```

### GET /admin/audit-logs
Get audit trail of system actions.

**Query Parameters:**
- `user_id`: Filter by user
- `action_type`: CREATE, UPDATE, DELETE, LOGIN
- `resource_type`: PRODUCT, TOKEN, USER, FEE
- `start_date`: Start of period
- `end_date`: End of period

**Response:**
```json
{
  "logs": [
    {
      "id": "log_789",
      "user_id": "user_123",
      "user_email": "manager@fund.com",
      "action": "CREATE",
      "resource_type": "PRODUCT",
      "resource_id": "prod_123",
      "details": {"name": "New Fund"},
      "ip_address": "192.168.1.100",
      "timestamp": "2024-01-20T14:30:00Z"
    }
  ]
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

API requests are rate-limited to:
- **100 requests/minute** for standard endpoints
- **10 requests/minute** for heavy operations (bulk imports, complex calculations)

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705764000
```
