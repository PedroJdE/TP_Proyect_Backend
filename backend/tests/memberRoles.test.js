import test from 'node:test'
import assert from 'node:assert/strict'

import { MEMBER_WORKSPACE_ROLES, normalizeWorkspaceRole } from '../src/constants/memberRoles.constant.js'

test('normaliza roles de invitación compatibles con el frontend', () => {
  assert.equal(normalizeWorkspaceRole('OWNER'), MEMBER_WORKSPACE_ROLES.OWNER)
  assert.equal(normalizeWorkspaceRole('ADMIN'), MEMBER_WORKSPACE_ROLES.ADMIN)
  assert.equal(normalizeWorkspaceRole('USER'), MEMBER_WORKSPACE_ROLES.USER)
  assert.equal(normalizeWorkspaceRole('dueño'), MEMBER_WORKSPACE_ROLES.OWNER)
  assert.equal(normalizeWorkspaceRole('admin'), MEMBER_WORKSPACE_ROLES.ADMIN)
  assert.equal(normalizeWorkspaceRole('usuario'), MEMBER_WORKSPACE_ROLES.USER)
})
