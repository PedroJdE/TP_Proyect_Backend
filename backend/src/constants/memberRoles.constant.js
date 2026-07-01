
export const MEMBER_WORKSPACE_ROLES = {
    OWNER: 'dueño',
    USER: 'usuario',
    ADMIN: 'admin'
};

export const MEMBER_CHANNEL_ROLES = {
    OWNER: 'dueño',
    ADMIN: 'admin',
    USER: 'usuario'
};

export const normalizeWorkspaceRole = (role) => {
    if (!role) return MEMBER_WORKSPACE_ROLES.USER;

    const normalized = String(role).trim().toLowerCase();

    if (normalized === 'owner' || normalized === 'dueño' || normalized === 'dueno') {
        return MEMBER_WORKSPACE_ROLES.OWNER;
    }

    if (normalized === 'admin') {
        return MEMBER_WORKSPACE_ROLES.ADMIN;
    }

    if (normalized === 'user' || normalized === 'usuario' || normalized === 'member') {
        return MEMBER_WORKSPACE_ROLES.USER;
    }

    return role;
};