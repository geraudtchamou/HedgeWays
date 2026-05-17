"""
Tokenization API Routes
FastAPI endpoints for managing tokenized assets, wallets, and transactions.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from database import get_db  # Assuming main.py defines this dependency
from tokenization_models import (
    TokenCreate, TokenResponse, 
    InvestorWalletCreate, InvestorWalletResponse,
    TransferRequest, DividendDistributionRequest,
    TokenTransaction, ComplianceStatus
)
from tokenization_service import TokenizationService, TokenizationError
from tokenization_db import Token, InvestorWallet

router = APIRouter(prefix="/api/v1/tokenization", tags=["Tokenization"])

# --- Dependencies ---
def get_token_service(db: Session = Depends(get_db)) -> TokenizationService:
    return TokenizationService(db)

# --- Token Endpoints ---

@router.post("/tokens", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def create_token(token_data: TokenCreate, service: TokenizationService = Depends(get_token_service)):
    """
    Create a new security token representing a Real World Asset.
    Requires admin privileges in production.
    """
    try:
        token = service.create_token(token_data)
        return token
    except TokenizationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tokens", response_model=List[TokenResponse])
def list_tokens(
    skip: int = 0, 
    limit: int = 100, 
    token_type: Optional[str] = None,
    service: TokenizationService = Depends(get_token_service)
):
    """List all available tokens with optional filtering."""
    query = service.db.query(Token)
    if token_type:
        query = query.filter(Token.token_type == token_type)
    
    tokens = query.offset(skip).limit(limit).all()
    return tokens

@router.get("/tokens/{token_id}", response_model=TokenResponse)
def get_token(token_id: UUID, service: TokenizationService = Depends(get_token_service)):
    """Get details of a specific token."""
    token = service.get_token(token_id)
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    return token

@router.post("/tokens/{token_id}/suspend")
def suspend_token(token_id: UUID, reason: str = Query(...), service: TokenizationService = Depends(get_token_service)):
    """Suspend trading for a token (Regulatory action)."""
    try:
        token = service.suspend_token(token_id, reason)
        return {"message": f"Token {token.symbol} suspended", "status": token.status}
    except TokenizationError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Wallet Endpoints ---

@router.post("/wallets", response_model=InvestorWalletResponse, status_code=status.HTTP_201_CREATED)
def create_wallet(wallet_data: InvestorWalletCreate, service: TokenizationService = Depends(get_token_service)):
    """Register a new investor wallet."""
    wallet = service.create_wallet(
        user_id=wallet_data.user_id,
        wallet_address=wallet_data.wallet_address,
        accreditation=wallet_data.accreditation_level,
        country=wallet_data.country_of_residence
    )
    return wallet

@router.get("/wallets/{wallet_id}", response_model=InvestorWalletResponse)
def get_wallet(wallet_id: UUID, service: TokenizationService = Depends(get_token_service)):
    """Get wallet details and balances."""
    wallet = service.db.query(InvestorWallet).filter(InvestorWallet.id == wallet_id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Manually construct response with holdings
    holdings = service.get_wallet_holdings(wallet_id)
    
    return {
        "id": wallet.id,
        "user_id": wallet.user_id,
        "wallet_address": wallet.wallet_address,
        "kyc_status": wallet.kyc_status.value,
        "accreditation_level": wallet.accreditation_level,
        "country_of_residence": wallet.country_of_residence,
        "created_at": wallet.created_at,
        "balances": {h['token_symbol']: h['balance'] for h in holdings},
        "frozen_balance": {h['token_symbol']: h['frozen_balance'] for h in holdings}
    }

@router.put("/wallets/{wallet_id}/kyc")
def update_kyc(wallet_id: UUID, status: ComplianceStatus, service: TokenizationService = Depends(get_token_service)):
    """Update KYC/AML status for an investor."""
    try:
        wallet = service.update_kyc_status(wallet_id, status)
        return {"message": "KYC status updated", "wallet_id": str(wallet.id), "status": wallet.kyc_status.value}
    except TokenizationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/wallets/{wallet_id}/holdings")
def get_holdings(wallet_id: UUID, service: TokenizationService = Depends(get_token_service)):
    """Get detailed asset holdings for a wallet."""
    holdings = service.get_wallet_holdings(wallet_id)
    return {"wallet_id": str(wallet_id), "holdings": holdings}

# --- Transaction Endpoints ---

@router.post("/transfers", response_model=dict)
def transfer_tokens(request: TransferRequest, service: TokenizationService = Depends(get_token_service)):
    """Transfer tokens between verified wallets."""
    try:
        tx = service.transfer_tokens(request)
        return {
            "message": "Transfer successful",
            "tx_hash": tx.tx_hash,
            "amount": tx.amount,
            "token_id": str(tx.token_id)
        }
    except TokenizationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/mint", response_model=dict)
def mint_tokens(token_id: UUID, wallet_id: UUID, amount: float, service: TokenizationService = Depends(get_token_service)):
    """Mint new tokens to a specific wallet (Initial distribution or treasury)."""
    try:
        tx = service.mint_to_wallet(token_id, wallet_id, amount)
        return {
            "message": "Minting successful",
            "tx_hash": tx.tx_hash,
            "amount": tx.amount,
            "new_circulating_supply": tx.token.circulating_supply
        }
    except TokenizationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/dividends/distribute", response_model=dict)
def distribute_dividends(request: DividendDistributionRequest, service: TokenizationService = Depends(get_token_service)):
    """Distribute dividends to all holders of a specific token."""
    try:
        result = service.distribute_dividends(request)
        return result
    except TokenizationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transactions/{tx_id}")
def get_transaction(tx_id: UUID, service: TokenizationService = Depends(get_token_service)):
    """Get details of a specific transaction."""
    from tokenization_db import TokenTransaction
    tx = service.db.query(TokenTransaction).filter(TokenTransaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.get("/tokens/{token_id}/transactions")
def get_token_transactions(token_id: UUID, limit: int = 50, service: TokenizationService = Depends(get_token_service)):
    """Get recent transaction history for a specific token."""
    from tokenization_db import TokenTransaction
    txs = service.db.query(TokenTransaction)\
        .filter(TokenTransaction.token_id == token_id)\
        .order_by(TokenTransaction.timestamp.desc())\
        .limit(limit)\
        .all()
    return txs
