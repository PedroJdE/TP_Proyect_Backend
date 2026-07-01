import test from 'node:test'
import assert from 'node:assert/strict'

import { buildWorkspaceInvitationEmail } from '../src/helpers/emailTemplates.helper.js'

test('genera el contenido del correo de invitación con el nombre del workspace', () => {
  const mail = buildWorkspaceInvitationEmail({
    recipientEmail: 'persona@empresa.com',
    workspaceName: 'Equipo de Producto',
    inviterName: 'Pedro',
    workspaceUrl: 'http://localhost:5174/workspaces/123'
  })

  assert.equal(mail.to, 'persona@empresa.com')
  assert.match(mail.subject, /Invitación/i)
  assert.match(mail.html, /Equipo de Producto/)
  assert.match(mail.html, /Pedro/)
})
