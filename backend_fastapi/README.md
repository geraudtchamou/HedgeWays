# Emerging Markets Investment Platform - FastAPI Backend

A comprehensive backend API for managing emerging market investments with asset tokenization capabilities.

## Features

- **Financial Products Management**: Create and manage investment products across 7 asset classes (commodities, stocks, bonds, real estate, manufacturing, mining, crypto)
- **Asset Tokenization**: Tokenize real-world assets with KYC/AML compliance
- **Wallet Management**: Investor wallet registration and KYC verification
- **Transaction Processing**: Secure token transfers with balance tracking
- **Fee Management**: Flexible fee structures with multiple calculation methods
- **Analytics & Dashboards**: Comprehensive metrics and role-based dashboards

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with async SQLAlchemy
- **Validation**: Pydantic v2
- **Authentication**: JWT with python-jose
- **Documentation**: OpenAPI/Swagger

## Project Structure

```
backend_fastapi/
├── app/
│   ├── api/v1/endpoints/    # API route handlers
│   ├── core/                # Core configuration and utilities
│   ├── db/                  # Database session and models
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic services
│   └── main.py              # Application entry point
├── tests/                   # Test files
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Installation

1. **Clone the repository**
```bash
cd backend_fastapi
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
Create a `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/em_platform
SECRET_KEY=your-secret-key-here
DEBUG=true
```

5. **Run the application**
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once running, access the interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Products
- `POST /api/v1/products/` - Create a new financial product
- `GET /api/v1/products/` - List all products
- `GET /api/v1/products/{id}` - Get product details
- `PUT /api/v1/products/{id}` - Update a product
- `DELETE /api/v1/products/{id}` - Delete a product

### Tokens
- `POST /api/v1/tokens/` - Create a token for a product
- `GET /api/v1/tokens/{id}` - Get token details
- `POST /api/v1/tokens/{id}/mint` - Mint additional tokens

### Wallets
- `POST /api/v1/wallets/register` - Register investor wallet
- `GET /api/v1/wallets/{id}` - Get wallet details
- `PUT /api/v1/wallets/{id}/kyc` - Update KYC status
- `GET /api/v1/wallets/{id}/holdings` - Get wallet holdings
- `GET /api/v1/wallets/{id}/transactions` - Get wallet transactions

### Transactions
- `POST /api/v1/transactions/` - Create a transaction
- `GET /api/v1/transactions/{id}` - Get transaction details

### Fees
- `POST /api/v1/fees/` - Create fee structure
- `GET /api/v1/fees/{id}` - Get fee structure
- `POST /api/v1/fees/{id}/calculate` - Calculate fee

## Development

### Running Tests
```bash
pytest tests/ -v --cov=app
```

### Code Formatting
```bash
black app/
isort app/
flake8 app/
```

### Type Checking
```bash
mypy app/
```

## License

MIT License
