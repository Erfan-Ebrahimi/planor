import fa from '../lang/fa.js'

const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/u
const usernamePattern = /^[A-Za-z0-9]+(?:[._][A-Za-z0-9]+)*$/u

export function validateLogin({ identifier, password }, allowUsername) {
  const errors = {}
  const isUsername = identifier.length >= 3 && identifier.length <= 16 && usernamePattern.test(identifier)
  if (!emailPattern.test(identifier) && !(allowUsername && isUsername)) {
    errors.identifier = allowUsername ? fa.auth.errors.invalidIdentifier : fa.auth.errors.invalidEmail
  }
  if (!password) errors.password = fa.auth.errors.requiredPassword
  return errors
}

export function validateRegistration({ email, password, consent }, minimumPasswordLength) {
  const errors = {}
  if (!emailPattern.test(email)) errors.email = fa.auth.errors.invalidEmail
  if (!password) {
    errors.password = fa.auth.errors.requiredPassword
  } else if (password.length < minimumPasswordLength) {
    errors.password = fa.auth.errors.weakPassword
  }
  if (!consent) errors.consent = fa.auth.errors.consentRequired
  return errors
}
