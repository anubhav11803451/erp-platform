import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '@erp/db';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Get the roles required for this endpoint (from @Roles decorator)
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no roles are required, allow access
        if (!requiredRoles) {
            return true;
        }

        // Get the user from the request (attached by JwtAuthGuard)
        const { user } = context.switchToHttp().getRequest<{ user?: User }>();
        // If there's no user on the request, deny access
        if (!user) {
            return false;
        }

        // Check if the user's role is one of the required roles
        return requiredRoles.some((role) => user.role === role);
    }
}
