"""
Tokenization Database Models
SQLAlchemy ORM models for persistent storage of tokenization data.
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from datetime import datetime
from enum import Enum as PyEnum

Base = declarative_base()

class TokenTypeDB(PyEnum):
    EQUITY = "EQUITY"
    DEBT = "DEBT"
    COMMODITY = "COMMODITY"
    UTILITY = "UTILITY"
    GOVERNANCE = "GOVERNANCE"

class ComplianceStatusDB(PyEnum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class TransactionTypeDB(PyEnum):
    MINT = "MINT"
    BURN = "BURN"
    TRANSFER = "TRANSFER"
    DIVIDEND_DISTRIBUTION = "DIVIDEND_DISTRIBUTION"
    FREEZE = "FREEZE"
    UNFREEZE = "UNFREEZE"

class Token(Base):
    __tablename__ = "tokens"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    symbol = Column(String, unique=True, nullable=False, index=True)
    underlying_asset_id = Column(String, nullable=False) # Links to RWA table
    token_type = Column(Enum(TokenTypeDB), nullable=False)
    
    total_supply = Column(Integer, nullable=False)
    circulating_supply = Column(Integer, default=0)
    decimals = Column(Integer, default=18)
    
    issue_price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    
    lock_up_days = Column(Integer, default=0)
    min_investment = Column(Float, default=0.0)
    max_investment = Column(Float, nullable=True)
    is_dividend_eligible = Column(Boolean, default=False)
    
    status = Column(String, default="ACTIVE") # ACTIVE, SUSPENDED, DELISTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transactions = relationship("TokenTransaction", back_populates="token")
    wallets = relationship("InvestorWallet", secondary="wallet_holdings", back_populates="tokens")

class InvestorWallet(Base):
    __tablename__ = "investor_wallets"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    wallet_address = Column(String, unique=True, nullable=False)
    
    kyc_status = Column(Enum(ComplianceStatusDB), default=ComplianceStatusDB.PENDING)
    accreditation_level = Column(String, default="RETAIL")
    country_of_residence = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tokens = relationship("Token", secondary="wallet_holdings", back_populates="wallets")
    sent_transactions = relationship("TokenTransaction", foreign_keys="TokenTransaction.from_wallet_id", back_populates="sender")
    received_transactions = relationship("TokenTransaction", foreign_keys="TokenTransaction.to_wallet_id", back_populates="receiver")

class WalletHolding(Base):
    """Association table for many-to-many relationship between Wallets and Tokens with balance info"""
    __tablename__ = "wallet_holdings"

    wallet_id = Column(PG_UUID(as_uuid=True), ForeignKey("investor_wallets.id"), primary_key=True)
    token_id = Column(PG_UUID(as_uuid=True), ForeignKey("tokens.id"), primary_key=True)
    
    balance = Column(Float, default=0.0)
    frozen_balance = Column(Float, default=0.0) # Locked due to lock-up or regulatory freeze
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to Token for easy access in queries
    token = relationship("Token", backref="holdings")

class TokenTransaction(Base):
    __tablename__ = "token_transactions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token_id = Column(PG_UUID(as_uuid=True), ForeignKey("tokens.id"), nullable=False, index=True)
    
    type = Column(Enum(TransactionTypeDB), nullable=False)
    
    from_wallet_id = Column(PG_UUID(as_uuid=True), ForeignKey("investor_wallets.id"), nullable=True)
    to_wallet_id = Column(PG_UUID(as_uuid=True), ForeignKey("investor_wallets.id"), nullable=True)
    
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="COMPLETED") # PENDING, COMPLETED, FAILED, REVERTED
    tx_hash = Column(String, nullable=True) # Simulated blockchain hash
    
    extra_data = Column(JSON, default=dict)  # Renamed from 'metadata' to avoid conflict
    memo = Column(Text, nullable=True)

    # Relationships
    token = relationship("Token", back_populates="transactions")
    sender = relationship("InvestorWallet", foreign_keys=[from_wallet_id], back_populates="sent_transactions")
    receiver = relationship("InvestorWallet", foreign_keys=[to_wallet_id], back_populates="received_transactions")
