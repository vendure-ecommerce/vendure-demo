export type TenantMode = 'readonly' | 'public';

export function getTenantMode(): TenantMode {
    const mode = process.env.TENANT_MODE?.toLowerCase();
    if (mode === 'public') return 'public';
    return 'readonly';
}

export const isReadonlyMode = () => getTenantMode() === 'readonly';
export const isPublicMode = () => getTenantMode() === 'public';
