import {Injectable} from '@nestjs/common';
import {AdministratorService, Permission, RequestContextService, RoleService} from '@vendure/core';

@Injectable()
export class DemoUserService {
    constructor(
        private roleService: RoleService,
        private administratorService: AdministratorService,
        private requestContextService: RequestContextService,
    ) {}

    async createDemoAdministrators(
        roleName: string,
        permissions: Permission[],
        firstName: string,
        lastName: string,
        emailAddress: string,
        password: string
    ) {
        // Get the superadmin user to ensure operations run with superadmin privileges
        const ctx = await this.requestContextService.create({
            apiType: 'admin',
            user: { id: 1 } as any,
        });

        // Create the role with specified permissions
        const role = await this.roleService.create(ctx, {
            code: roleName.toLowerCase().replace(/\s+/g, '-'),
            description: roleName,
            permissions,
        });

        // Create the administrator with the new role
        const administrator = await this.administratorService.create(ctx, {
            firstName,
            lastName,
            emailAddress,
            password,
            roleIds: [role.id],
        });

        return { role, administrator };
    }
}
