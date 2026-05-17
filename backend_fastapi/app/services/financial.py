from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
import logging

from app.models.financial import (
    Product, Token, InvestorWallet, WalletHolding, 
    TokenTransaction, FeeStructure, AssetClass
)
from app.schemas.financial import (
    ProductCreate, ProductUpdate, TokenCreate, 
    WalletRegister, TransactionCreate, FeeStructureCreate
)

logger = logging.getLogger("em_platform.services")


class ProductService:
    """Service for managing financial products."""
    
    @staticmethod
    async def create_product(db: AsyncSession, product_data: ProductCreate) -> Product:
        """Create a new financial product."""
        product = Product(**product_data.model_dump())
        db.add(product)
        await db.flush()
        await db.refresh(product)
        logger.info(f"Created product: {product.name} ({product.ticker})")
        return product
    
    @staticmethod
    async def get_product(db: AsyncSession, product_id: int) -> Optional[Product]:
        """Get a product by ID."""
        result = await db.execute(select(Product).where(Product.id == product_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_products(
        db: AsyncSession, 
        asset_class: Optional[AssetClass] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Product]:
        """Get products with optional filtering."""
        query = select(Product)
        if asset_class:
            query = query.where(Product.asset_class == asset_class)
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def update_product(
        db: AsyncSession, 
        product_id: int, 
        product_data: ProductUpdate
    ) -> Optional[Product]:
        """Update a product."""
        product = await ProductService.get_product(db, product_id)
        if not product:
            return None
        
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(product)
        logger.info(f"Updated product: {product.name}")
        return product
    
    @staticmethod
    async def delete_product(db: AsyncSession, product_id: int) -> bool:
        """Delete a product."""
        product = await ProductService.get_product(db, product_id)
        if not product:
            return False
        
        await db.delete(product)
        await db.flush()
        logger.info(f"Deleted product: {product.name}")
        return True


class TokenService:
    """Service for managing tokenized assets."""
    
    @staticmethod
    async def create_token(db: AsyncSession, token_data: TokenCreate) -> Token:
        """Create a new token for a product."""
        token = Token(**token_data.model_dump())
        token.circulating_supply = token_data.total_supply
        db.add(token)
        await db.flush()
        await db.refresh(token)
        
        # Update product tokenization status
        product = await ProductService.get_product(db, token_data.product_id)
        if product:
            product.is_tokenized = True
            product.token_address = token_data.token_address
            product.total_supply = token_data.total_supply
        
        logger.info(f"Created token: {token.token_address}")
        return token
    
    @staticmethod
    async def get_token(db: AsyncSession, token_id: int) -> Optional[Token]:
        """Get a token by ID."""
        result = await db.execute(select(Token).where(Token.id == token_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def mint_tokens(
        db: AsyncSession, 
        token_id: int, 
        amount: float
    ) -> Optional[Token]:
        """Mint additional tokens."""
        token = await TokenService.get_token(db, token_id)
        if not token:
            return None
        
        token.total_supply += amount
        token.circulating_supply += amount
        await db.flush()
        await db.refresh(token)
        logger.info(f"Minted {amount} tokens for token {token.id}")
        return token


class WalletService:
    """Service for managing investor wallets."""
    
    @staticmethod
    async def register_wallet(db: AsyncSession, wallet_data: WalletRegister) -> InvestorWallet:
        """Register a new investor wallet."""
        wallet = InvestorWallet(**wallet_data.model_dump())
        db.add(wallet)
        await db.flush()
        await db.refresh(wallet)
        logger.info(f"Registered wallet: {wallet.wallet_address}")
        return wallet
    
    @staticmethod
    async def get_wallet(db: AsyncSession, wallet_id: int) -> Optional[InvestorWallet]:
        """Get a wallet by ID."""
        result = await db.execute(select(InvestorWallet).where(InvestorWallet.id == wallet_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_kyc(
        db: AsyncSession, 
        wallet_id: int, 
        kyc_status: str,
        accreditation_status: bool = False
    ) -> Optional[InvestorWallet]:
        """Update wallet KYC status."""
        wallet = await WalletService.get_wallet(db, wallet_id)
        if not wallet:
            return None
        
        wallet.kyc_status = kyc_status
        wallet.accreditation_status = accreditation_status
        if kyc_status == "verified":
            wallet.kyc_verified_at = datetime.utcnow()
        
        wallet.updated_at = datetime.utcnow()
        await db.flush()
        await db.refresh(wallet)
        logger.info(f"Updated KYC for wallet {wallet_id}: {kyc_status}")
        return wallet


class TransactionService:
    """Service for managing token transactions."""
    
    @staticmethod
    async def create_transaction(
        db: AsyncSession, 
        tx_data: TransactionCreate
    ) -> TokenTransaction:
        """Create a new token transaction."""
        # Validate wallet and token exist
        wallet = await WalletService.get_wallet(db, tx_data.wallet_id)
        if not wallet:
            raise ValueError(f"Wallet {tx_data.wallet_id} not found")
        
        token = await TokenService.get_token(db, tx_data.token_id)
        if not token:
            raise ValueError(f"Token {tx_data.token_id} not found")
        
        # Check KYC if required
        if token.is_kyc_required and wallet.kyc_status != "verified":
            raise ValueError("Wallet KYC not verified")
        
        # Create transaction
        total_value = tx_data.amount * tx_data.price if tx_data.price else None
        
        transaction = TokenTransaction(
            wallet_id=tx_data.wallet_id,
            token_id=tx_data.token_id,
            transaction_type=tx_data.transaction_type.value,
            amount=tx_data.amount,
            price=tx_data.price,
            total_value=total_value,
            counterparty_wallet_id=tx_data.counterparty_wallet_id,
            status="confirmed"
        )
        
        db.add(transaction)
        await db.flush()
        await db.refresh(transaction)
        
        # Update holdings based on transaction type
        await TransactionService._update_holdings(db, transaction, token)
        
        logger.info(f"Created transaction: {transaction.transaction_type} - {transaction.amount}")
        return transaction
    
    @staticmethod
    async def _update_holdings(
        db: AsyncSession, 
        transaction: TokenTransaction,
        token: Token
    ) -> None:
        """Update wallet holdings based on transaction."""
        from sqlalchemy import select
        
        if transaction.transaction_type in ["mint", "transfer"]:
            # Add to wallet balance
            holding_result = await db.execute(
                select(WalletHolding).where(
                    WalletHolding.wallet_id == transaction.wallet_id,
                    WalletHolding.token_id == transaction.token_id
                )
            )
            holding = holding_result.scalar_one_or_none()
            
            if holding:
                holding.balance += transaction.amount
            else:
                holding = WalletHolding(
                    wallet_id=transaction.wallet_id,
                    token_id=transaction.token_id,
                    balance=transaction.amount
                )
                db.add(holding)
        
        elif transaction.transaction_type == "burn":
            # Remove from wallet balance
            holding_result = await db.execute(
                select(WalletHolding).where(
                    WalletHolding.wallet_id == transaction.wallet_id,
                    WalletHolding.token_id == transaction.token_id
                )
            )
            holding = holding_result.scalar_one_or_none()
            
            if holding:
                holding.balance -= transaction.amount
                if holding.balance < 0:
                    raise ValueError("Insufficient balance")
        
        await db.flush()


class FeeService:
    """Service for managing fee structures and calculations."""
    
    @staticmethod
    async def create_fee_structure(
        db: AsyncSession, 
        fee_data: FeeStructureCreate
    ) -> FeeStructure:
        """Create a new fee structure."""
        fee = FeeStructure(**fee_data.model_dump())
        db.add(fee)
        await db.flush()
        await db.refresh(fee)
        logger.info(f"Created fee structure: {fee.fee_name}")
        return fee
    
    @staticmethod
    async def calculate_fee(
        db: AsyncSession,
        fee_structure: FeeStructure,
        aum: float,
        performance: Optional[float] = None,
        high_water_mark: Optional[float] = None
    ) -> float:
        """Calculate fee based on fee structure."""
        fee_amount = 0.0
        
        if fee_structure.calculation_method == "flat":
            fee_amount = fee_structure.fixed_amount or 0.0
        
        elif fee_structure.calculation_method == "percentage":
            if fee_structure.percentage:
                fee_amount = aum * (fee_structure.percentage / 100.0)
        
        elif fee_structure.calculation_method == "performance":
            if performance and fee_structure.percentage:
                # Apply hurdle rate if exists
                if fee_structure.hurdle_rate:
                    excess_return = max(0, performance - fee_structure.hurdle_rate)
                else:
                    excess_return = performance
                
                # Apply high water mark if exists
                if high_water_mark and performance <= high_water_mark:
                    excess_return = 0
                
                fee_amount = excess_return * (fee_structure.percentage / 100.0)
        
        logger.info(f"Calculated fee: {fee_amount} for {fee_structure.fee_name}")
        return fee_amount
