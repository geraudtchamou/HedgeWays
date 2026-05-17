from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

from app.models.admin import (
    Permission, Role, User, AuditLog, 
    role_permissions, user_roles,
    ResourceType, ActionLevel
)
from app.schemas.admin import (
    PermissionCreate, PermissionUpdate,
    RoleCreate, RoleUpdate,
    UserCreate, UserUpdate,
    AuditLogCreate
)

class AdminService:
    def __init__(self, db: Session):
        self.db = db

    # ==================== PERMISSION MANAGEMENT ====================
    
    def create_permission(self, permission_data: PermissionCreate) -> Permission:
        """Create a new permission"""
        permission = Permission(
            name=permission_data.name,
            resource=permission_data.resource,
            action=permission_data.action,
            description=permission_data.description
        )
        self.db.add(permission)
        self.db.commit()
        self.db.refresh(permission)
        return permission
    
    def get_permission(self, permission_id: int) -> Optional[Permission]:
        """Get permission by ID"""
        return self.db.query(Permission).filter(Permission.id == permission_id).first()
    
    def get_all_permissions(self, skip: int = 0, limit: int = 100) -> List[Permission]:
        """Get all permissions with pagination"""
        return self.db.query(Permission).offset(skip).limit(limit).all()
    
    def update_permission(self, permission_id: int, permission_data: PermissionUpdate) -> Optional[Permission]:
        """Update permission"""
        permission = self.get_permission(permission_id)
        if not permission:
            return None
        
        update_data = permission_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(permission, field, value)
        
        self.db.commit()
        self.db.refresh(permission)
        return permission
    
    def delete_permission(self, permission_id: int) -> bool:
        """Delete permission"""
        permission = self.get_permission(permission_id)
        if not permission:
            return False
        
        self.db.delete(permission)
        self.db.commit()
        return True

    # ==================== ROLE MANAGEMENT ====================
    
    def create_role(self, role_data: RoleCreate) -> Role:
        """Create a new role with permissions"""
        role = Role(
            name=role_data.name,
            description=role_data.description,
            is_system_role=role_data.is_system_role
        )
        
        # Assign permissions
        if role_data.permission_ids:
            permissions = self.db.query(Permission).filter(
                Permission.id.in_(role_data.permission_ids)
            ).all()
            role.permissions = permissions
        
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role
    
    def get_role(self, role_id: int) -> Optional[Role]:
        """Get role by ID with permissions"""
        return self.db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(Role.id == role_id).first()
    
    def get_all_roles(self, skip: int = 0, limit: int = 100, include_system: bool = True) -> List[Role]:
        """Get all roles with pagination"""
        query = self.db.query(Role).options(joinedload(Role.permissions))
        if not include_system:
            query = query.filter(Role.is_system_role == False)
        return query.offset(skip).limit(limit).all()
    
    def update_role(self, role_id: int, role_data: RoleUpdate) -> Optional[Role]:
        """Update role and its permissions"""
        role = self.get_role(role_id)
        if not role:
            return None
        
        # Prevent modification of system roles
        if role.is_system_role and (role_data.name or role_data.is_system_role is not None):
            raise ValueError("Cannot modify core properties of system roles")
        
        update_data = role_data.model_dump(exclude_unset=True)
        if 'permission_ids' in update_data:
            permission_ids = update_data.pop('permission_ids')
            permissions = self.db.query(Permission).filter(
                Permission.id.in_(permission_ids)
            ).all()
            role.permissions = permissions
        
        for field, value in update_data.items():
            setattr(role, field, value)
        
        self.db.commit()
        self.db.refresh(role)
        return role
    
    def delete_role(self, role_id: int) -> bool:
        """Delete role (cannot delete system roles)"""
        role = self.get_role(role_id)
        if not role:
            return False
        
        if role.is_system_role:
            raise ValueError("Cannot delete system roles")
        
        self.db.delete(role)
        self.db.commit()
        return True
    
    def check_permission(self, role_id: int, resource: ResourceType, action: ActionLevel) -> bool:
        """Check if a role has a specific permission"""
        role = self.get_role(role_id)
        if not role:
            return False
        
        for permission in role.permissions:
            if permission.resource == resource and permission.action == action:
                return True
        return False

    # ==================== USER MANAGEMENT ====================
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user with roles"""
        # Check if email already exists
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise ValueError("Email already registered")
        
        user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            is_active=user_data.is_active
        )
        
        # Hash password (in real app, store in separate table or add field)
        # For this example, we'll assume password handling is done elsewhere
        
        # Assign roles
        if user_data.role_ids:
            roles = self.db.query(Role).filter(Role.id.in_(user_data.role_ids)).all()
            user.roles = roles
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_user(self, user_id: int) -> Optional[User]:
        """Get user by ID with roles"""
        return self.db.query(User).options(
            joinedload(User.roles)
        ).filter(User.id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).options(
            joinedload(User.roles)
        ).filter(User.email == email).first()
    
    def get_all_users(self, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None) -> List[User]:
        """Get all users with pagination and filtering"""
        query = self.db.query(User).options(joinedload(User.roles))
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        return query.offset(skip).limit(limit).all()
    
    def update_user(self, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Update user and their roles"""
        user = self.get_user(user_id)
        if not user:
            return None
        
        update_data = user_data.model_dump(exclude_unset=True)
        if 'role_ids' in update_data:
            role_ids = update_data.pop('role_ids')
            roles = self.db.query(Role).filter(Role.id.in_(role_ids)).all()
            user.roles = roles
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def deactivate_user(self, user_id: int) -> Optional[User]:
        """Deactivate a user"""
        user = self.get_user(user_id)
        if not user:
            return None
        
        user.is_active = False
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_user_permissions(self, user_id: int) -> List[Dict[str, str]]:
        """Get all permissions for a user through their roles"""
        user = self.get_user(user_id)
        if not user:
            return []
        
        permissions = set()
        for role in user.roles:
            for permission in role.permissions:
                permissions.add((permission.resource.value, permission.action.value))
        
        return [{"resource": r, "action": a} for r, a in permissions]

    # ==================== AUDIT LOGGING ====================
    
    def log_audit(self, audit_data: AuditLogCreate) -> AuditLog:
        """Create an audit log entry"""
        audit_log = AuditLog(
            user_id=audit_data.user_id,
            role_id=audit_data.role_id,
            action=audit_data.action,
            resource_type=audit_data.resource_type,
            resource_id=audit_data.resource_id,
            details=audit_data.details,
            ip_address=audit_data.ip_address,
            user_agent=audit_data.user_agent
        )
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        return audit_log
    
    def get_audit_logs(
        self, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[int] = None,
        resource_type: Optional[str] = None,
        action: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[AuditLog]:
        """Get audit logs with filters"""
        query = self.db.query(AuditLog).options(
            joinedload(AuditLog.actor_user),
            joinedload(AuditLog.actor_role)
        )
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        if action:
            query = query.filter(AuditLog.action == action)
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        
        return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    
    def get_admin_dashboard_summary(self) -> Dict[str, Any]:
        """Get summary statistics for admin dashboard"""
        total_users = self.db.query(func.count(User.id)).scalar()
        active_users = self.db.query(func.count(User.id)).filter(User.is_active == True).scalar()
        total_roles = self.db.query(func.count(Role.id)).scalar()
        total_permissions = self.db.query(func.count(Permission.id)).scalar()
        system_roles = self.db.query(func.count(Role.id)).filter(Role.is_system_role == True).scalar()
        recent_logs = self.db.query(func.count(AuditLog.id)).filter(
            AuditLog.timestamp >= datetime.utcnow() - timedelta(days=7)
        ).scalar()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_roles": total_roles,
            "total_permissions": total_permissions,
            "system_roles_count": system_roles,
            "recent_audit_logs_count": recent_logs
        }
