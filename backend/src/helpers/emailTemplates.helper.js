export function buildWorkspaceInvitationEmail({ recipientEmail, workspaceName, inviterName, workspaceUrl }) {
  return {
    to: recipientEmail,
    subject: 'Invitación a workspace',
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <h2>¡Te invitaron a un workspace!</h2>
        <p>${inviterName || 'Alguien'} te invitó a colaborar en <strong>${workspaceName || 'un workspace'}</strong>.</p>
        <p>Ingresá al siguiente enlace para acceder:</p>
        <p><a href="${workspaceUrl || '#'}" style="color:#6d28d9">Abrir workspace</a></p>
      </div>
    `
  }
}
