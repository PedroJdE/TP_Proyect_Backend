import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeGmailAppPassword } from '../src/config/mailer.config.js'

test('quita los espacios de una contraseña de aplicación de Gmail', () => {
  assert.equal(normalizeGmailAppPassword('ykba jbvd qwqi dgrf'), 'ykbajbvdqwqidgrf')
  assert.equal(normalizeGmailAppPassword(' ykbajbvdqwqidgrf '), 'ykbajbvdqwqidgrf')
})
