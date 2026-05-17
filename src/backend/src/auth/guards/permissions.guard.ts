import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions) {
      throw new ForbiddenException('User does not have permissions');
    }

    // Check for wildcard permission
    if (user.permissions.includes('*:*')) {
      return true;
    }

    // Check if user has at least one required permission
    const hasPermission = requiredPermissions.some((permission) => {
      // Exact match
      if (user.permissions.includes(permission)) {
        return true;
      }

      // Wildcard match (e.g., 'products:*' matches 'products:read', 'products:create')
      const [resource] = permission.split(':');
      const action = permission.split(':')[1];

      if (user.permissions.includes(`${resource}:*`)) {
        return true;
      }

      // Full wildcard
      if (user.permissions.includes('*:*')) {
        return true;
      }

      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException(`Missing required permissions: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
