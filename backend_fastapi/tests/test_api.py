import pytest
from httpx import AsyncClient
from datetime import datetime

from app.main import app
from app.schemas.financial import AssetClass


@pytest.fixture
async def client():
    """Create async test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_check(client):
    """Test health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test root endpoint."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_create_product(client):
    """Test creating a financial product."""
    product_data = {
        "name": "Emerging Markets Bond Fund",
        "description": "Diversified bond fund for emerging markets",
        "asset_class": "bond",
        "ticker": "EMBF",
        "currency": "USD",
        "inception_date": datetime.utcnow().isoformat(),
        "metadata_json": {"region": "global"}
    }
    
    response = await client.post("/api/v1/products/", json=product_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == product_data["name"]
    assert data["ticker"] == product_data["ticker"]
    assert "id" in data


@pytest.mark.asyncio
async def test_get_products(client):
    """Test getting products list."""
    response = await client.get("/api/v1/products/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_create_product_validation(client):
    """Test product creation validation."""
    # Missing required field
    invalid_data = {
        "name": "Test Fund",
        # missing asset_class
        "ticker": "TEST",
        "inception_date": datetime.utcnow().isoformat()
    }
    
    response = await client.post("/api/v1/products/", json=invalid_data)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_fee_calculation(client):
    """Test fee calculation endpoint."""
    # First create a product
    product_data = {
        "name": "Test Fund",
        "asset_class": "stock",
        "ticker": "TSTF",
        "currency": "USD",
        "inception_date": datetime.utcnow().isoformat()
    }
    
    product_response = await client.post("/api/v1/products/", json=product_data)
    product_id = product_response.json()["id"]
    
    # Create fee structure
    fee_data = {
        "product_id": product_id,
        "fee_name": "Management Fee",
        "fee_type": "management",
        "calculation_method": "percentage",
        "percentage": 1.5,
        "billing_frequency": "monthly"
    }
    
    fee_response = await client.post("/api/v1/fees/", json=fee_data)
    assert fee_response.status_code == 201
    fee_id = fee_response.json()["id"]
    
    # Calculate fee
    calc_response = await client.post(
        f"/api/v1/fees/{fee_id}/calculate?aum=1000000"
    )
    assert calc_response.status_code == 200
    data = calc_response.json()
    assert "calculated_fee" in data
    assert data["calculated_fee"] == 15000.0  # 1.5% of 1M
