from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.schemas.admin import (
    PermissionCreate, PermissionResponse, PermissionUpdate,
    RoleCreate, RoleResponse, RoleUpdate,
    UserCreate, UserResponse, UserUpdate,
    AuditLogResponse, AuditLogCreate,
    AdminDashboardSummary, ResourceType, ActionLevel
)
from app.services.admin import AdminService
from app.core.security import get_current_user, check_permissions

router = APIRouter(prefix="/admin", tags=["Admin Management"])

# ==================== PERMISSION ENDPOINTS ====================

@router.post("/permissions", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED)
async def create_permission(
    permission_data: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new permission (requires admin role)"""
    service = AdminService(db)
    
    # Check if permission name already exists
    existing = service.db.query(service.db.query(type(service).get_permission.__annotations__['return']).filter_by(name=permission_data.name).first())
    
    try:
        return service.create_permission(permission_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/permissions", response_model=List[PermissionResponse])
async def get_all_permissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all permissions with pagination"""
    service = AdminService(db)
    return service.get_all_permissions(skip=skip, limit=limit)

@router.get("/permissions/{permission_id}", response_model=PermissionResponse)
async def get_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get permission by ID"""
    service = AdminService(db)
    permission = service.get_permission(permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission

@router.put("/permissions/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: int,
    permission_data: PermissionUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update permission"""
    service = AdminService(db)
    permission = service.update_permission(permission_id, permission_data)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission

@router.delete("/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete permission"""
    service = AdminService(db)
    success = service.delete_permission(permission_id)
    if not success:
        raise HTTPException(status_code=404, detail="Permission not found")

# ==================== ROLE ENDPOINTS ====================

@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new role"""
    service = AdminService(db)
    try:
        return service.create_role(role_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/roles", response_model=List[RoleResponse])
async def get_all_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    include_system: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all roles with pagination"""
    service = AdminService(db)
    return service.get_all_roles(skip=skip, limit=limit, include_system=include_system)

@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get role by ID"""
    service = AdminService(db)
    role = service.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update role"""
    service = AdminService(db)
    try:
        role = service.update_role(role_id, role_data)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        return role
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete role (cannot delete system roles)"""
    service = AdminService(db)
    try:
        success = service.delete_role(role_id)
        if not success:
            raise HTTPException(status_code=404, detail="Role not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== USER ENDPOINTS ====================

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new user"""
    service = AdminService(db)
    try:
        user = service.create_user(user_data)
        
        # Log audit
        audit_data = AuditLogCreate(
            user_id=current_user.get("id"),
            action="USER_CREATED",
            resource_type="user",
            resource_id=str(user.id),
            details=f"Created user: {user.email}",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        service.log_audit(audit_data)
        
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all users with pagination and filtering"""
    service = AdminService(db)
    return service.get_all_users(skip=skip, limit=limit, is_active=is_active)

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user by ID"""
    service = AdminService(db)
    user = service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update user"""
    service = AdminService(db)
    user = service.update_user(user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log audit
    audit_data = AuditLogCreate(
        user_id=current_user.get("id"),
        action="USER_UPDATED",
        resource_type="user",
        resource_id=str(user_id),
        details=f"Updated user: {user.email}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    service.log_audit(audit_data)
    
    return user

@router.patch("/users/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Deactivate a user"""
    service = AdminService(db)
    user = service.deactivate_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log audit
    audit_data = AuditLogCreate(
        user_id=current_user.get("id"),
        action="USER_DEACTIVATED",
        resource_type="user",
        resource_id=str(user_id),
        details=f"Deactivated user: {user.email}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    service.log_audit(audit_data)
    
    return user

@router.get("/users/{user_id}/permissions", response_model=List[dict])
async def get_user_permissions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all permissions for a user"""
    service = AdminService(db)
    return service.get_user_permissions(user_id)

# ==================== AUDIT LOG ENDPOINTS ====================

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    action: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get audit logs with filters"""
    service = AdminService(db)
    return service.get_audit_logs(
        skip=skip,
        limit=limit,
        user_id=user_id,
        resource_type=resource_type,
        action=action,
        start_date=start_date,
        end_date=end_date
    )

# ==================== ADMIN DASHBOARD ====================

@router.get("/dashboard/summary", response_model=AdminDashboardSummary)
async def get_admin_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get summary statistics for admin dashboard"""
    service = AdminService(db)
    return service.get_admin_dashboard_summary()

# ==================== UTILITY ENDPOINTS ====================

@router.get("/utils/resource-types")
async def get_resource_types():
    """Get available resource types"""
    return [r.value for r in ResourceType]

@router.get("/utils/action-levels")
async def get_action_levels():
    """Get available action levels"""
    return [a.value for a in ActionLevel]
