from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from functools import wraps
from typing import Any, Callable, Optional
from sqlalchemy.orm import Session
from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class SecurityError(Exception):
    """Custom security exception."""
    pass


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> dict:
    """
    Get current user from JWT token.
    This is a placeholder implementation - in production, decode and validate JWT.
    """
    # Placeholder: In production, decode JWT token and fetch user from DB
    # For now, return a mock user with admin role for testing
    return {
        "id": 1,
        "email": "admin@example.com",
        "roles": ["admin"],
        "permissions": ["*"]  # Wildcard for all permissions
    }


def check_permissions(required_resource: str, required_action: str):
    """Dependency to check if user has required permission."""
    async def permission_checker(
        current_user: dict = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # If user has wildcard permission, allow all
        if "*" in current_user.get("permissions", []):
            return current_user
        
        # Check specific permission (implementation depends on your permission system)
        # This is a simplified check
        user_permissions = current_user.get("permissions", [])
        required_perm = f"{required_resource}:{required_action}"
        
        if required_perm not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {required_perm} required"
            )
        
        return current_user
    
    return permission_checker


def verify_permission(required_permission: str):
    """Decorator to verify user permissions."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Get current user from context (implementation depends on auth system)
            current_user = kwargs.get("current_user")
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not authenticated"
                )
            
            # Allow wildcard permissions
            if "*" in current_user.get("permissions", []):
                return await func(*args, **kwargs)
            
            if required_permission not in current_user.get("permissions", []):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {required_permission} required"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def validate_business_rules(rules: list):
    """Decorator to validate business rules."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            for rule in rules:
                if not await rule(kwargs):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Business rule violation: {rule.__name__}"
                    )
            return await func(*args, **kwargs)
        return wrapper
    return decorator
