# Developer Guide

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Code Style & Standards](#code-style--standards)
3. [Testing](#testing)
4. [Database Migrations](#database-migrations)
5. [Contributing Guidelines](#contributing-guidelines)

---

## Development Environment Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)
- Docker & Docker Compose (recommended)

### Backend Setup

#### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate on Linux/Mac
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development tools
```

#### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/em_platform
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development
DEBUG=True
```

#### 4. Initialize Database
```bash
alembic upgrade head
```

#### 5. Run Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Configure Environment
Create a `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

#### 3. Run Development Server
```bash
npm run dev
```

### Docker Setup (Recommended)

#### 1. Build and Start Services
```bash
docker-compose up --build
```

#### 2. Run Migrations
```bash
docker-compose exec backend alembic upgrade head
```

#### 3. Access Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

---

## Code Style & Standards

### Python Backend

#### Formatting
We use **Black** for code formatting and **isort** for import sorting.

```bash
# Format code
black app/

# Sort imports
isort app/

# Check formatting
black --check app/
isort --check app/
```

#### Type Checking
We use **mypy** for static type checking.

```bash
mypy app/
```

#### Linting
We use **flake8** and **pylint** for linting.

```bash
flake8 app/
pylint app/
```

#### Pre-commit Hooks
Install pre-commit hooks to automatically check code before commits:

```bash
pip install pre-commit
pre-commit install
```

Configuration is in `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: ['pydantic', 'sqlalchemy']
```

### TypeScript Frontend

#### Formatting & Linting
We use **ESLint** and **Prettier**.

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### Type Checking
TypeScript type checking runs automatically during build:

```bash
npm run build
```

#### Code Organization
- Components in `src/components/`
- Pages in `src/pages/`
- Hooks in `src/hooks/`
- Utils in `src/utils/`
- Types in `src/types/`
- Store in `src/store/`

---

## Testing

### Backend Testing

We use **pytest** with **pytest-asyncio** for async testing.

#### Run All Tests
```bash
pytest
```

#### Run Specific Test File
```bash
pytest tests/test_products.py
```

#### Run with Coverage
```bash
pytest --cov=app --cov-report=html
```

#### Test Structure
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_product(auth_token):
    response = client.post(
        "/api/v1/products",
        json={"name": "Test Fund", "asset_class": "STOCK"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Fund"
```

#### Fixtures
Common fixtures are in `tests/conftest.py`:
- `db_session`: Test database session
- `auth_token`: Valid JWT token
- `test_user`: Created test user
- `test_product`: Created test product

### Frontend Testing

We use **Jest** and **React Testing Library**.

#### Run All Tests
```bash
npm test
```

#### Run in Watch Mode
```bash
npm test -- --watch
```

#### Run with Coverage
```bash
npm test -- --coverage
```

#### Test Example
```typescript
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

test('displays portfolio value', () => {
  render(<Dashboard />);
  expect(screen.getByText(/portfolio value/i)).toBeInTheDocument();
});
```

---

## Database Migrations

We use **Alembic** for database schema migrations.

### Create New Migration
```bash
alembic revision -m "add_token_table"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

### View Migration History
```bash
alembic history
```

### Migration Best Practices
1. Always test migrations on a copy of production data
2. Write reversible migrations (implement `downgrade()`)
3. Keep migrations small and focused
4. Never modify existing migration files after they're deployed

Example Migration:
```python
"""add token table

Revision ID: abc123
Revises: def456
Create Date: 2024-01-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'tokens',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('token_name', sa.String(), nullable=False),
        sa.Column('token_symbol', sa.String(), nullable=False),
        sa.Column('total_supply', sa.BigInteger(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('tokens')
```

---

## Contributing Guidelines

### Branch Naming Convention
- `feature/description`: New features
- `bugfix/description`: Bug fixes
- `hotfix/description`: Critical production fixes
- `docs/description`: Documentation updates
- `refactor/description`: Code refactoring

### Commit Message Format
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Example:
```
feat(tokens): add dividend distribution endpoint

Implemented POST /tokens/dividends for automated dividend 
distribution to token holders.

Closes #123
```

### Pull Request Process

1. **Fork** the repository
2. **Create** your feature branch
3. **Make** your changes
4. **Test** thoroughly (unit, integration, manual)
5. **Update** documentation if needed
6. **Submit** PR with clear description
7. **Address** review feedback
8. **Squash** commits if necessary
9. **Merge** after approval

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered
- [ ] Backwards compatibility maintained

### Code Review Guidelines

#### Reviewers Should Check:
- Correctness and logic
- Edge cases and error handling
- Security implications
- Performance considerations
- Test coverage
- Code clarity and maintainability

#### Review Response Time
- Standard PRs: Within 2 business days
- Critical hotfixes: Within 4 hours

---

## Debugging

### Backend Debugging

#### Enable Debug Logging
```env
LOG_LEVEL=DEBUG
DEBUG=True
```

#### Use Python Debugger
```python
import pdb; pdb.set_trace()
```

#### Inspect SQL Queries
```python
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    print(f"Executing: {statement}")
    print(f"Parameters: {parameters}")
```

### Frontend Debugging

#### React DevTools
Install React DevTools extension for browser.

#### Redux/Zustand DevTools
State management devtools are enabled in development mode.

#### Network Inspection
Use browser DevTools Network tab to inspect API calls.

---

## Performance Optimization

### Backend
- Use async database operations
- Implement caching with Redis
- Optimize database queries with indexes
- Use connection pooling
- Profile with `cProfile` or `py-spy`

### Frontend
- Lazy load components
- Memoize expensive calculations
- Optimize bundle size with code splitting
- Use React.memo for pure components
- Profile with React DevTools Profiler

---

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Validate all inputs**: Use Pydantic schemas
3. **Use parameterized queries**: Prevent SQL injection
4. **Implement rate limiting**: Protect against DoS
5. **Keep dependencies updated**: Regular security audits
6. **Use HTTPS**: In production only
7. **Sanitize outputs**: Prevent XSS

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Pytest Documentation](https://docs.pytest.org/)
