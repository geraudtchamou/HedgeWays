"""
Tokenization Models and Schemas
Defines data structures for Digital Tokens, Investor Wallets, and Transactions.
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

class TokenType(str, Enum):
    EQUITY = "EQUITY"  # e.g., Real Estate Share
    DEBT = "DEBT"      # e.g., Bond Token
    COMMODITY = "COMMODITY" # e.g., Gold backed
    UTILITY = "UTILITY"
    GOVERNANCE = "GOVERNANCE"

class ComplianceStatus(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class TransactionType(str, Enum):
    MINT = "MINT"
    BURN = "BURN"
    TRANSFER = "TRANSFER"
    DIVIDEND_DISTRIBUTION = "DIVIDEND_DISTRIBUTION"
    FREEZE = "FREEZE"
    UNFREEZE = "UNFREEZE"

# --- Schemas ---

class TokenCreate(BaseModel):
    name: str
    symbol: str
    underlying_asset_id: str  # Reference to the RWA (e.g., Property ID)
    token_type: TokenType
    total_supply: int = Field(..., gt=0)
    decimals: int = Field(default=18, ge=0, le=18)
    issue_price: float = Field(..., gt=0)
    currency: str = "USD"
    lock_up_days: int = Field(default=0, ge=0)
    min_investment: float = Field(default=0.0, ge=0)
    max_investment: Optional[float] = None
    is_dividend_eligible: bool = False
    
    @validator('symbol')
    def symbol_uppercase(cls, v):
        return v.upper()

class TokenResponse(TokenCreate):
    id: UUID
    created_at: datetime
    circulating_supply: int = 0
    status: str = "ACTIVE"

class InvestorWalletCreate(BaseModel):
    user_id: str
    wallet_address: str
    kyc_status: ComplianceStatus = ComplianceStatus.PENDING
    accreditation_level: str = "RETAIL" # RETAIL, ACCREDITED, INSTITUTIONAL
    country_of_residence: str

class InvestorWalletResponse(InvestorWalletCreate):
    id: UUID
    created_at: datetime
    balances: Dict[str, float] = {} # Token Symbol -> Balance
    frozen_balance: Dict[str, float] = {}

class TransferRequest(BaseModel):
    sender_wallet_id: UUID
    receiver_wallet_id: UUID
    token_id: UUID
    amount: float = Field(..., gt=0)
    memo: Optional[str] = None

class DividendDistributionRequest(BaseModel):
    token_id: UUID
    amount_per_token: float = Field(..., gt=0)
    currency: str = "USD"
    distribution_date: datetime

class TokenTransaction(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    token_id: UUID
    type: TransactionType
    from_wallet_id: Optional[UUID]
    to_wallet_id: Optional[UUID]
    amount: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "COMPLETED"
    tx_hash: Optional[str] = None # Simulated blockchain hash
    metadata: Dict[str, Any] = {}
