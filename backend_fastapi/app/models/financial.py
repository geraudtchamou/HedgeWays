from datetime import datetime, timedelta
from typing import Optional, Any
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float, Enum as SQLEnum, JSON, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession
from enum import Enum

from app.db.session import Base


class AssetClass(str, Enum):
    """Enumeration of asset classes."""
    COMMODITY = "commodity"
    STOCK = "stock"
    BOND = "bond"
    REAL_ESTATE = "real_estate"
    MANUFACTURING = "manufacturing"
    MINING = "mining"
    CRYPTO = "crypto"


class TokenType(str, Enum):
    """Token types for asset tokenization."""
    SECURITY = "security"
    UTILITY = "utility"
    GOVERNANCE = "governance"
    STABLECOIN = "stablecoin"


class Product(Base):
    """Financial product model."""
    __tablename__ = "products"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    asset_class: Mapped[AssetClass] = mapped_column(SQLEnum(AssetClass), nullable=False, index=True)
    ticker: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    
    # Financial metrics
    nav: Mapped[float] = mapped_column(Float, default=0.0)
    aum: Mapped[float] = mapped_column(Float, default=0.0)
    inception_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    
    # Tokenization
    is_tokenized: Mapped[bool] = mapped_column(Boolean, default=False)
    token_address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    token_type: Mapped[Optional[TokenType]] = mapped_column(SQLEnum(TokenType), nullable=True)
    total_supply: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Metadata
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tokens = relationship("Token", back_populates="product", cascade="all, delete-orphan")
    fee_structures = relationship("FeeStructure", back_populates="product", cascade="all, delete-orphan")


class Token(Base):
    """Tokenized asset model."""
    __tablename__ = "tokens"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    token_address: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    blockchain: Mapped[str] = mapped_column(String(50), default="ethereum")
    token_standard: Mapped[str] = mapped_column(String(20), default="ERC-20")
    
    # Supply
    total_supply: Mapped[float] = mapped_column(Float, default=0.0)
    circulating_supply: Mapped[float] = mapped_column(Float, default=0.0)
    locked_supply: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Compliance
    is_kyc_required: Mapped[bool] = mapped_column(Boolean, default=True)
    is_accredited_only: Mapped[bool] = mapped_column(Boolean, default=False)
    lockup_period_days: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="tokens")
    holdings = relationship("WalletHolding", back_populates="token", cascade="all, delete-orphan")
    transactions = relationship("TokenTransaction", back_populates="token", cascade="all, delete-orphan")


class InvestorWallet(Base):
    """Investor wallet model."""
    __tablename__ = "investor_wallets"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    investor_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    wallet_address: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    blockchain: Mapped[str] = mapped_column(String(50), default="ethereum")
    
    # KYC Status
    kyc_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, verified, rejected
    kyc_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    accreditation_status: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Risk profile
    risk_tolerance: Mapped[str] = mapped_column(String(20), default="moderate")
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    holdings = relationship("WalletHolding", back_populates="wallet", cascade="all, delete-orphan")
    transactions = relationship("TokenTransaction", back_populates="wallet", cascade="all, delete-orphan")


class WalletHolding(Base):
    """Wallet holding model for token balances."""
    __tablename__ = "wallet_holdings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    wallet_id: Mapped[int] = mapped_column(Integer, ForeignKey("investor_wallets.id"), nullable=False, index=True)
    token_id: Mapped[int] = mapped_column(Integer, ForeignKey("tokens.id"), nullable=False, index=True)
    
    balance: Mapped[float] = mapped_column(Float, default=0.0)
    locked_balance: Mapped[float] = mapped_column(Float, default=0.0)
    average_cost: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Lockup information
    lockup_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    wallet = relationship("InvestorWallet", back_populates="holdings")
    token = relationship("Token", back_populates="holdings")


class TokenTransaction(Base):
    """Token transaction ledger."""
    __tablename__ = "token_transactions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    wallet_id: Mapped[int] = mapped_column(Integer, ForeignKey("investor_wallets.id"), nullable=False, index=True)
    token_id: Mapped[int] = mapped_column(Integer, ForeignKey("tokens.id"), nullable=False, index=True)
    
    transaction_type: Mapped[str] = mapped_column(String(50), nullable=False)  # mint, burn, transfer, dividend
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Blockchain info
    tx_hash: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    block_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Counterparty (for transfers)
    counterparty_wallet_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("investor_wallets.id"), nullable=True)
    
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, confirmed, failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    wallet = relationship("InvestorWallet", back_populates="transactions", foreign_keys=[wallet_id])
    token = relationship("Token", back_populates="transactions")
    counterparty_wallet = relationship("InvestorWallet", foreign_keys=[counterparty_wallet_id])


class FeeStructure(Base):
    """Fee structure model for products."""
    __tablename__ = "fee_structures"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    
    fee_name: Mapped[str] = mapped_column(String(100), nullable=False)
    fee_type: Mapped[str] = mapped_column(String(50), nullable=False)  # management, performance, transaction
    calculation_method: Mapped[str] = mapped_column(String(50), nullable=False)  # flat, percentage, tiered
    
    # Fee parameters
    fixed_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    hurdle_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    high_water_mark: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Billing
    billing_frequency: Mapped[str] = mapped_column(String(20), default="monthly")  # daily, monthly, quarterly, annually
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="fee_structures")
