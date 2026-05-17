from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ResourceType(str, Enum):
    PRODUCT = "product"
    FEE = "fee"
    ANALYTICS = "analytics"
    DASHBOARD = "dashboard"
    TOKENIZATION = "tokenization"
    USER = "user"
    ROLE = "role"
    SYSTEM = "system"

class ActionLevel(str, Enum):
    READ = "read"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    APPROVE = "approve"
    EXPORT = "export"
    ADMIN = "admin"

# Permission Schemas
class PermissionBase(BaseModel):
    name: str = Field(..., description="Permission name, e.g., 'product:create'")
    resource: ResourceType
    action: ActionLevel
    description: Optional[str] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    description: Optional[str] = None

class PermissionResponse(PermissionBase):
    id: int
    
    class Config:
        from_attributes = True

# Role Schemas
class RoleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    is_system_role: bool = False

class RoleCreate(RoleBase):
    permission_ids: List[int] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None

class RoleResponse(RoleBase):
    id: int
    permissions: List[PermissionResponse] = []
    
    class Config:
        from_attributes = True

# User Management Schemas
class UserRole(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2)
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role_ids: List[int] = []

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_ids: Optional[List[int]] = None

class UserResponse(UserBase):
    id: int
    roles: List[UserRole] = []
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogBase(BaseModel):
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[int] = None
    role_id: Optional[int] = None

class AuditLogResponse(AuditLogBase):
    id: int
    timestamp: datetime
    user_id: Optional[int] = None
    role_id: Optional[int] = None
    user_email: Optional[str] = None
    role_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Admin Dashboard Summary
class AdminDashboardSummary(BaseModel):
    total_users: int
    active_users: int
    total_roles: int
    total_permissions: int
    recent_audit_logs_count: int
    system_roles_count: int
