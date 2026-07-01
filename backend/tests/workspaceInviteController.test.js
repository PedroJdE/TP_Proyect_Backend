import test from 'node:test';
import assert from 'node:assert/strict';

import workspaceController from '../controllers/workspace.controller.js';
import workspaceMemberRepository from '../src/repositories/workspaceMembers.repository.js';
import workspaceRepository from '../src/repositories/workspace.repository.js';
import userRepository from '../src/repositories/user.repository.js';
import channelRepository from '../src/repositories/channel.repository.js';
import channelMembersRepository from '../src/repositories/channelMembers.repository.js';
import mailer_transport from '../src/config/mailer.config.js';

test('devuelve feedback claro cuando falla el envío del correo de invitación', async () => {
  const originalGetMembership = workspaceMemberRepository.getMembership;
  const originalInviteMember = workspaceMemberRepository.inviteMember;
  const originalGetByEmail = userRepository.getByEmail;
  const originalGetById = workspaceRepository.getById;
  const originalFindByWorkspaceId = channelRepository.findByWorkspaceId;
  const originalFindByChannelIdAndUserId = channelMembersRepository.findByChannelIdAndUserId;
  const originalCreateChannelMember = channelMembersRepository.create;
  const originalSendMail = mailer_transport.sendMail;

  workspaceMemberRepository.getMembership = async () => ({ rol: 'dueño' });
  workspaceMemberRepository.inviteMember = async () => ({ _id: 'member-1' });
  userRepository.getByEmail = async () => ({ _id: 'user-2', email: 'invitee@test.com' });
  workspaceRepository.getById = async () => ({ nombre: 'Workspace de prueba' });
  channelRepository.findByWorkspaceId = async () => [];
  channelMembersRepository.findByChannelIdAndUserId = async () => null;
  channelMembersRepository.create = async () => ({ _id: 'channel-member-1' });
  mailer_transport.sendMail = async () => {
    throw new Error('SMTP failed');
  };

  const request = {
    params: { workspace_id: 'workspace-1' },
    user: { id: 'owner-id', nombre: 'Test Owner' },
    body: { email: 'invitee@test.com', rol: 'USER' }
  };

  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };

  try {
    await workspaceController.inviteMember(request, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.data.mailSent, false);
    assert.match(response.body.message, /correo/i);
    assert.equal(response.body.data.mailError, 'SMTP failed');
  } finally {
    workspaceMemberRepository.getMembership = originalGetMembership;
    workspaceMemberRepository.inviteMember = originalInviteMember;
    userRepository.getByEmail = originalGetByEmail;
    workspaceRepository.getById = originalGetById;
    channelRepository.findByWorkspaceId = originalFindByWorkspaceId;
    channelMembersRepository.findByChannelIdAndUserId = originalFindByChannelIdAndUserId;
    channelMembersRepository.create = originalCreateChannelMember;
    mailer_transport.sendMail = originalSendMail;
  }
});
