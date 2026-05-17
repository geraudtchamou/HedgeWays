from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base

# Association table for Role-Permission many-to-many
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

# Association table for User-Role many-to-many
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True)
)

class ResourceType(str, enum.Enum):
    PRODUCT = "product"
    FEE = "fee"
    ANALYTICS = "analytics"
    DASHBOARD = "dashboard"
    TOKENIZATION = "tokenization"
    USER = "user"
    ROLE = "role"
    SYSTEM = "system"

class ActionLevel(str, enum.Enum):
    READ = "read"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    APPROVE = "approve"
    EXPORT = "export"
    ADMIN = "admin"

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # e.g., "product:create"
    resource = Column(SQLEnum(ResourceType), nullable=False)
    action = Column(SQLEnum(ActionLevel), nullable=False)
    description = Column(String)
    
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # e.g., "Compliance Officer"
    description = Column(String)
    is_system_role = Column(Boolean, default=False)  # Prevent deletion of system roles
    
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
    users = relationship("User", secondary=user_roles, back_populates="roles")
    
    # Audit relationship
    audit_logs = relationship("AuditLog", back_populates="actor_role")

class User(Base):
    __tablename__ = "users"
    
    # Assuming basic user fields exist, adding relationship
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="actor_user")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    action = Column(String, nullable=False)  # e.g., "ROLE_UPDATED"
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(String)  # JSON string of changes
    ip_address = Column(String)
    user_agent = Column(String)

    actor_user = relationship("User", back_populates="audit_logs")
    actor_role = relationship("Role", back_populates="audit_logs")
