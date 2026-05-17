from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.db.session import get_db
from app.schemas.financial import (
    ProductCreate, ProductResponse, ProductUpdate,
    TokenCreate, TokenResponse,
    WalletRegister, WalletResponse, WalletKYCUpdate,
    HoldingResponse, TransactionCreate, TransactionResponse,
    FeeStructureCreate, FeeStructureResponse
)
from app.services.financial import (
    ProductService, TokenService, WalletService, 
    TransactionService, FeeService
)
from app.models.financial import AssetClass

logger = logging.getLogger("em_platform.api")

# Router prefixes
products_router = APIRouter(prefix="/products", tags=["Products"])
tokens_router = APIRouter(prefix="/tokens", tags=["Tokens"])
wallets_router = APIRouter(prefix="/wallets", tags=["Wallets"])
transactions_router = APIRouter(prefix="/transactions", tags=["Transactions"])
fees_router = APIRouter(prefix="/fees", tags=["Fees"])


# Product Endpoints
@products_router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new financial product."""
    try:
        product = await ProductService.create_product(db, product_data)
        return product
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@products_router.get("/", response_model=List[ProductResponse])
async def get_products(
    asset_class: Optional[AssetClass] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Get all products with optional filtering."""
    products = await ProductService.get_products(db, asset_class, skip, limit)
    return products


@products_router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific product by ID."""
    product = await ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@products_router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a product."""
    product = await ProductService.update_product(db, product_id, product_data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@products_router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a product."""
    success = await ProductService.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")


# Token Endpoints
@tokens_router.post("/", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def create_token(
    token_data: TokenCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new token for a product."""
    try:
        token = await TokenService.create_token(db, token_data)
        return token
    except Exception as e:
        logger.error(f"Error creating token: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@tokens_router.get("/{token_id}", response_model=TokenResponse)
async def get_token(token_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific token by ID."""
    token = await TokenService.get_token(db, token_id)
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    return token


@tokens_router.post("/{token_id}/mint", response_model=TokenResponse)
async def mint_tokens(
    token_id: int,
    amount: float = Query(..., gt=0),
    db: AsyncSession = Depends(get_db)
):
    """Mint additional tokens."""
    token = await TokenService.mint_tokens(db, token_id, amount)
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    return token


# Wallet Endpoints
@wallets_router.post("/register", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
async def register_wallet(
    wallet_data: WalletRegister,
    db: AsyncSession = Depends(get_db)
):
    """Register a new investor wallet."""
    try:
        wallet = await WalletService.register_wallet(db, wallet_data)
        return wallet
    except Exception as e:
        logger.error(f"Error registering wallet: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@wallets_router.get("/{wallet_id}", response_model=WalletResponse)
async def get_wallet(wallet_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific wallet by ID."""
    wallet = await WalletService.get_wallet(db, wallet_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet


@wallets_router.put("/{wallet_id}/kyc", response_model=WalletResponse)
async def update_wallet_kyc(
    wallet_id: int,
    kyc_data: WalletKYCUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update wallet KYC status."""
    wallet = await WalletService.update_kyc(
        db, 
        wallet_id, 
        kyc_data.kyc_status,
        kyc_data.accreditation_status
    )
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet


@wallets_router.get("/{wallet_id}/holdings", response_model=List[HoldingResponse])
async def get_wallet_holdings(wallet_id: int, db: AsyncSession = Depends(get_db)):
    """Get all holdings for a wallet."""
    from sqlalchemy import select
    from app.models.financial import WalletHolding
    
    result = await db.execute(
        select(WalletHolding).where(WalletHolding.wallet_id == wallet_id)
    )
    holdings = list(result.scalars().all())
    return holdings


# Transaction Endpoints
@transactions_router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    tx_data: TransactionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new token transaction."""
    try:
        transaction = await TransactionService.create_transaction(db, tx_data)
        return transaction
    except ValueError as e:
        logger.error(f"Transaction validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating transaction: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@transactions_router.get("/{tx_id}", response_model=TransactionResponse)
async def get_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific transaction by ID."""
    from sqlalchemy import select
    from app.models.financial import TokenTransaction
    
    result = await db.execute(
        select(TokenTransaction).where(TokenTransaction.id == tx_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@wallets_router.get("/{wallet_id}/transactions", response_model=List[TransactionResponse])
async def get_wallet_transactions(wallet_id: int, db: AsyncSession = Depends(get_db)):
    """Get all transactions for a wallet."""
    from sqlalchemy import select
    from app.models.financial import TokenTransaction
    
    result = await db.execute(
        select(TokenTransaction).where(TokenTransaction.wallet_id == wallet_id)
        .order_by(TokenTransaction.created_at.desc())
    )
    transactions = list(result.scalars().all())
    return transactions


# Fee Endpoints
@fees_router.post("/", response_model=FeeStructureResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_structure(
    fee_data: FeeStructureCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new fee structure."""
    try:
        fee = await FeeService.create_fee_structure(db, fee_data)
        return fee
    except Exception as e:
        logger.error(f"Error creating fee structure: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@fees_router.get("/{fee_id}", response_model=FeeStructureResponse)
async def get_fee_structure(fee_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific fee structure by ID."""
    from sqlalchemy import select
    from app.models.financial import FeeStructure
    
    result = await db.execute(
        select(FeeStructure).where(FeeStructure.id == fee_id)
    )
    fee = result.scalar_one_or_none()
    
    if not fee:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    return fee


@fees_router.post("/{fee_id}/calculate")
async def calculate_fee(
    fee_id: int,
    aum: float = Query(..., gt=0),
    performance: Optional[float] = Query(None),
    high_water_mark: Optional[float] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Calculate fee based on fee structure."""
    from sqlalchemy import select
    from app.models.financial import FeeStructure
    
    result = await db.execute(
        select(FeeStructure).where(FeeStructure.id == fee_id)
    )
    fee_structure = result.scalar_one_or_none()
    
    if not fee_structure:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    
    fee_amount = await FeeService.calculate_fee(
        db, fee_structure, aum, performance, high_water_mark
    )
    
    return {
        "fee_structure_id": fee_id,
        "fee_name": fee_structure.fee_name,
        "calculated_fee": fee_amount,
        "currency": fee_structure.currency
    }
