"""
Tokenization Service Layer
Handles business logic for minting, transferring, compliance checks, and dividend distributions.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID
import hashlib

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from tokenization_db import (
    Token, InvestorWallet, WalletHolding, TokenTransaction,
    TokenTypeDB, ComplianceStatusDB, TransactionTypeDB
)
from tokenization_models import (
    TokenCreate, TransferRequest, DividendDistributionRequest,
    ComplianceStatus, TransactionType
)

class TokenizationError(Exception):
    """Custom exception for tokenization errors"""
    pass

class TokenizationService:
    def __init__(self, db: Session):
        self.db = db

    # --- Token Management ---

    def create_token(self, token_data: TokenCreate) -> Token:
        """Mints a new token representing a Real World Asset"""
        # Check if symbol already exists
        existing = self.db.query(Token).filter(Token.symbol == token_data.symbol.upper()).first()
        if existing:
            raise TokenizationError(f"Token symbol {token_data.symbol} already exists")

        db_token = Token(
            name=token_data.name,
            symbol=token_data.symbol.upper(),
            underlying_asset_id=token_data.underlying_asset_id,
            token_type=TokenTypeDB[token_data.token_type.value],
            total_supply=token_data.total_supply,
            circulating_supply=0,  # Initially 0 until minted to treasury or sold
            decimals=token_data.decimals,
            issue_price=token_data.issue_price,
            currency=token_data.currency,
            lock_up_days=token_data.lock_up_days,
            min_investment=token_data.min_investment,
            max_investment=token_data.max_investment,
            is_dividend_eligible=token_data.is_dividend_eligible,
            status="ACTIVE"
        )
        
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return db_token

    def get_token(self, token_id: UUID) -> Optional[Token]:
        return self.db.query(Token).filter(Token.id == token_id).first()

    def suspend_token(self, token_id: UUID, reason: str) -> Token:
        """Suspends trading for a token (e.g., regulatory issue)"""
        token = self.get_token(token_id)
        if not token:
            raise TokenizationError(f"Token {token_id} not found")
        
        token.status = "SUSPENDED"
        self._log_transaction(
            token_id=token_id,
            tx_type=TransactionTypeDB.FREEZE,
            amount=0,
            metadata={"reason": reason, "action": "TOKEN_SUSPEND"}
        )
        self.db.commit()
        return token

    # --- Wallet & Compliance ---

    def create_wallet(self, user_id: str, wallet_address: str, 
                      accreditation: str, country: str) -> InvestorWallet:
        """Creates a new investor wallet"""
        wallet = InvestorWallet(
            user_id=user_id,
            wallet_address=wallet_address,
            kyc_status=ComplianceStatusDB.PENDING,
            accreditation_level=accreditation,
            country_of_residence=country
        )
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        return wallet

    def update_kyc_status(self, wallet_id: UUID, status: ComplianceStatus) -> InvestorWallet:
        """Updates KYC/AML status for an investor"""
        wallet = self.db.query(InvestorWallet).filter(InvestorWallet.id == wallet_id).first()
        if not wallet:
            raise TokenizationError(f"Wallet {wallet_id} not found")
        
        wallet.kyc_status = ComplianceStatusDB[status.value]
        self.db.commit()
        self.db.refresh(wallet)
        return wallet

    def _check_compliance(self, wallet: InvestorWallet, token: Token, amount: float, is_sender: bool) -> tuple[bool, str]:
        """Validates compliance rules before transaction"""
        if wallet.kyc_status != ComplianceStatusDB.VERIFIED:
            return False, "Wallet KYC not verified"
        
        if token.status != "ACTIVE":
            return False, f"Token is currently {token.status}"
        
        # Check accreditation requirements (simplified logic)
        if token.min_investment > 10000 and wallet.accreditation_level == "RETAIL":
             if is_sender:
                 pass # Sending is usually okay
             else:
                 # Check if this purchase meets minimums
                 current_price = token.issue_price # In real app, fetch market price
                 if amount * current_price < token.min_investment:
                     return False, "Investment amount below minimum requirement for retail investors"

        # Check country restrictions (Sanctions list simulation)
        restricted_countries = ["KP", "IR", "SY"] # Example
        if wallet.country_of_residence in restricted_countries:
            return False, "User from restricted jurisdiction"

        return True, "OK"

    # --- Transactions ---

    def transfer_tokens(self, request: TransferRequest) -> TokenTransaction:
        """Executes a token transfer between wallets with compliance checks"""
        sender = self.db.query(InvestorWallet).filter(InvestorWallet.id == request.sender_wallet_id).first()
        receiver = self.db.query(InvestorWallet).filter(InvestorWallet.id == request.receiver_wallet_id).first()
        token = self.db.query(Token).filter(Token.id == request.token_id).first()

        if not all([sender, receiver, token]):
            raise TokenizationError("Invalid sender, receiver, or token ID")

        # Compliance Checks
        valid, msg = self._check_compliance(sender, token, request.amount, is_sender=True)
        if not valid:
            raise TokenizationError(f"Sender compliance failed: {msg}")
        
        valid, msg = self._check_compliance(receiver, token, request.amount, is_sender=False)
        if not valid:
            raise TokenizationError(f"Receiver compliance failed: {msg}")

        # Lock-up Period Check
        holding = self.db.query(WalletHolding).filter(
            and_(WalletHolding.wallet_id == request.sender_wallet_id, WalletHolding.token_id == request.token_id)
        ).first()

        if holding:
            # In a real system, we'd check the acquisition date of these specific tokens
            # Here we simulate by checking if frozen balance exists
            if holding.frozen_balance >= request.amount:
                raise TokenizationError("Tokens are currently locked/frozen")

        # Balance Check
        if not holding or holding.balance < request.amount:
            raise TokenizationError("Insufficient balance")

        # Execute Transfer
        # 1. Deduct from sender
        holding.balance -= request.amount
        
        # 2. Add to receiver
        receiver_holding = self.db.query(WalletHolding).filter(
            and_(WalletHolding.wallet_id == request.receiver_wallet_id, WalletHolding.token_id == request.token_id)
        ).first()
        
        if not receiver_holding:
            receiver_holding = WalletHolding(wallet_id=request.receiver_wallet_id, token_id=request.token_id, balance=0)
            self.db.add(receiver_holding)
        
        receiver_holding.balance += request.amount

        # 3. Record Transaction
        tx = self._log_transaction(
            token_id=request.token_id,
            tx_type=TransactionTypeDB.TRANSFER,
            from_wallet=request.sender_wallet_id,
            to_wallet=request.receiver_wallet_id,
            amount=request.amount,
            memo=request.memo
        )

        self.db.commit()
        return tx

    def mint_to_wallet(self, token_id: UUID, wallet_id: UUID, amount: float) -> TokenTransaction:
        """Mints new tokens directly to a wallet (e.g., initial distribution)"""
        token = self.get_token(token_id)
        if not token:
            raise TokenizationError("Token not found")
        
        if token.circulating_supply + amount > token.total_supply:
            raise TokenizationError("Minting exceeds total supply")

        wallet = self.db.query(InvestorWallet).filter(InvestorWallet.id == wallet_id).first()
        if not wallet:
            raise TokenizationError("Wallet not found")

        # Update Supply
        token.circulating_supply += int(amount) # Assuming whole units for simplicity in supply count

        # Update Balance
        holding = self.db.query(WalletHolding).filter(
            and_(WalletHolding.wallet_id == wallet_id, WalletHolding.token_id == token_id)
        ).first()
        
        if not holding:
            holding = WalletHolding(wallet_id=wallet_id, token_id=token_id, balance=0, frozen_balance=0)
            self.db.add(holding)
        
        holding.balance += amount
        
        # Apply freeze if lock-up > 0
        if token.lock_up_days > 0:
            if holding.frozen_balance is None:
                holding.frozen_balance = 0
            holding.frozen_balance += amount
            # Note: A background job would unfreeze these after token.lock_up_days

        tx = self._log_transaction(
            token_id=token_id,
            tx_type=TransactionTypeDB.MINT,
            to_wallet=wallet_id,
            amount=amount,
            metadata={"initial_mint": True}
        )

        self.db.commit()
        return tx

    def distribute_dividends(self, request: DividendDistributionRequest) -> Dict[str, Any]:
        """Distributes dividends to all token holders"""
        token = self.get_token(request.token_id)
        if not token or not token.is_dividend_eligible:
            raise TokenizationError("Token not eligible for dividends")

        # Find all holders
        holdings = self.db.query(WalletHolding).filter(
            and_(WalletHolding.token_id == request.token_id, WalletHolding.balance > 0)
        ).all()

        total_distributed = 0.0
        distributions = []

        for holding in holdings:
            payout = holding.balance * request.amount_per_token
            total_distributed += payout
            
            # In a real app, this would trigger a fiat/crypto payment gateway
            distributions.append({
                "wallet_id": str(holding.wallet_id),
                "amount": payout,
                "currency": request.currency
            })

            # Log as transaction
            self._log_transaction(
                token_id=request.token_id,
                tx_type=TransactionTypeDB.DIVIDEND_DISTRIBUTION,
                to_wallet=holding.wallet_id,
                amount=payout, # Representing value distributed
                metadata={"dividend_per_token": request.amount_per_token, "currency": request.currency}
            )

        self.db.commit()
        
        return {
            "token_id": str(request.token_id),
            "total_distributed": total_distributed,
            "recipient_count": len(distributions),
            "details": distributions
        }

    def _log_transaction(self, token_id: UUID, tx_type: TransactionTypeDB, 
                         amount: float, from_wallet: Optional[UUID] = None, 
                         to_wallet: Optional[UUID] = None, 
                         memo: Optional[str] = None, 
                         metadata: Optional[Dict] = None) -> TokenTransaction:
        """Internal helper to record transactions"""
        # Generate simulated hash
        data = f"{token_id}{tx_type}{amount}{datetime.utcnow()}"
        tx_hash = hashlib.sha256(data.encode()).hexdigest()

        tx = TokenTransaction(
            token_id=token_id,
            type=tx_type,
            from_wallet_id=from_wallet,
            to_wallet_id=to_wallet,
            amount=amount,
            tx_hash=tx_hash,
            memo=memo,
            extra_data=metadata or {}  # Use renamed field
        )
        self.db.add(tx)
        return tx

    def get_wallet_holdings(self, wallet_id: UUID) -> List[Dict[str, Any]]:
        """Returns all token holdings for a specific wallet"""
        from sqlalchemy.orm import joinedload
        holdings = self.db.query(WalletHolding).options(
            joinedload(WalletHolding.token)
        ).filter(
            WalletHolding.wallet_id == wallet_id
        ).all()
        
        results = []
        for h in holdings:
            results.append({
                "token_symbol": h.token.symbol,
                "token_name": h.token.name,
                "balance": h.balance,
                "frozen_balance": h.frozen_balance,
                "available_balance": h.balance - (h.frozen_balance or 0),
                "current_value_usd": h.balance * h.token.issue_price # Simplified valuation
            })
        return results
