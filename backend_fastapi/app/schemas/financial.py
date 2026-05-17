from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from enum import Enum


class AssetClass(str, Enum):
    """Asset class enumeration."""
    COMMODITY = "commodity"
    STOCK = "stock"
    BOND = "bond"
    REAL_ESTATE = "real_estate"
    MANUFACTURING = "manufacturing"
    MINING = "mining"
    CRYPTO = "crypto"


class TokenType(str, Enum):
    """Token type enumeration."""
    SECURITY = "security"
    UTILITY = "utility"
    GOVERNANCE = "governance"
    STABLECOIN = "stablecoin"


class FeeCalculationMethod(str, Enum):
    """Fee calculation method enumeration."""
    FLAT = "flat"
    PERCENTAGE = "percentage"
    TIERED = "tiered"
    PERFORMANCE = "performance"


# Product Schemas
class ProductBase(BaseModel):
    """Base product schema."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    asset_class: AssetClass
    ticker: str = Field(..., min_length=1, max_length=50)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    inception_date: datetime
    metadata_json: Optional[dict] = None


class ProductCreate(ProductBase):
    """Schema for creating a product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    nav: Optional[float] = Field(None, ge=0)
    aum: Optional[float] = Field(None, ge=0)
    is_tokenized: Optional[bool] = None
    metadata_json: Optional[dict] = None


class ProductResponse(ProductBase):
    """Schema for product response."""
    id: int
    nav: float = 0.0
    aum: float = 0.0
    is_tokenized: bool = False
    token_address: Optional[str] = None
    token_type: Optional[TokenType] = None
    total_supply: float = 0.0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Token Schemas
class TokenBase(BaseModel):
    """Base token schema."""
    product_id: int
    blockchain: str = Field(default="ethereum", min_length=1, max_length=50)
    token_standard: str = Field(default="ERC-20", min_length=1, max_length=20)
    is_kyc_required: bool = True
    is_accredited_only: bool = False
    lockup_period_days: int = Field(default=0, ge=0)


class TokenCreate(TokenBase):
    """Schema for creating a token."""
    token_address: str = Field(..., min_length=1, max_length=255)
    total_supply: float = Field(default=0.0, ge=0)


class TokenResponse(TokenBase):
    """Schema for token response."""
    id: int
    token_address: str
    total_supply: float
    circulating_supply: float
    locked_supply: float
    created_at: datetime
    
    class Config:
        from_attributes = True


# Wallet Schemas
class WalletBase(BaseModel):
    """Base wallet schema."""
    investor_id: int
    blockchain: str = Field(default="ethereum", min_length=1, max_length=50)
    risk_tolerance: str = Field(default="moderate")


class WalletRegister(WalletBase):
    """Schema for registering a wallet."""
    wallet_address: str = Field(..., min_length=1, max_length=255)


class WalletKYCUpdate(BaseModel):
    """Schema for updating wallet KYC status."""
    kyc_status: str = Field(..., pattern="^(pending|verified|rejected)$")
    accreditation_status: bool = False


class WalletResponse(WalletBase):
    """Schema for wallet response."""
    id: int
    wallet_address: str
    kyc_status: str
    kyc_verified_at: Optional[datetime] = None
    accreditation_status: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Holding Schemas
class HoldingResponse(BaseModel):
    """Schema for wallet holding response."""
    id: int
    wallet_id: int
    token_id: int
    balance: float
    locked_balance: float
    average_cost: float
    lockup_until: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionType(str, Enum):
    """Transaction type enumeration."""
    MINT = "mint"
    BURN = "burn"
    TRANSFER = "transfer"
    DIVIDEND = "dividend"


class TransactionCreate(BaseModel):
    """Schema for creating a transaction."""
    wallet_id: int
    token_id: int
    transaction_type: TransactionType
    amount: float = Field(..., gt=0)
    price: Optional[float] = Field(None, ge=0)
    counterparty_wallet_id: Optional[int] = None


class TransactionResponse(BaseModel):
    """Schema for transaction response."""
    id: int
    wallet_id: int
    token_id: int
    transaction_type: str
    amount: float
    price: Optional[float] = None
    total_value: Optional[float] = None
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Fee Structure Schemas
class FeeStructureBase(BaseModel):
    """Base fee structure schema."""
    fee_name: str = Field(..., min_length=1, max_length=100)
    fee_type: str = Field(..., pattern="^(management|performance|transaction)$")
    calculation_method: FeeCalculationMethod
    billing_frequency: str = Field(default="monthly", pattern="^(daily|monthly|quarterly|annually)$")
    currency: str = Field(default="USD", min_length=3, max_length=3)


class FeeStructureCreate(FeeStructureBase):
    """Schema for creating a fee structure."""
    product_id: int
    fixed_amount: Optional[float] = Field(None, ge=0)
    percentage: Optional[float] = Field(None, ge=0, le=100)
    hurdle_rate: Optional[float] = Field(None, ge=0)
    high_water_mark: Optional[float] = Field(None, ge=0)


class FeeStructureResponse(FeeStructureBase):
    """Schema for fee structure response."""
    id: int
    product_id: int
    fixed_amount: Optional[float] = None
    percentage: Optional[float] = None
    hurdle_rate: Optional[float] = None
    high_water_mark: Optional[float] = None
    active: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Dashboard and Analytics Schemas
class DashboardWidget(BaseModel):
    """Schema for dashboard widget."""
    widget_id: str
    widget_type: str
    title: str
    data_source: str
    refresh_interval: int = 60
    config: Optional[dict] = None


class DashboardLayout(BaseModel):
    """Schema for dashboard layout."""
    user_role: str
    widgets: List[DashboardWidget]
    layout_config: Optional[dict] = None


class MetricRecord(BaseModel):
    """Schema for recording a metric."""
    metric_name: str
    metric_value: float
    dimensions: Optional[dict] = None
    timestamp: Optional[datetime] = None


class KPIResponse(BaseModel):
    """Schema for KPI response."""
    kpi_name: str
    current_value: float
    target_value: float
    status: str  # on_track, at_risk, off_track
    trend: str  # improving, stable, declining
    last_updated: datetime
