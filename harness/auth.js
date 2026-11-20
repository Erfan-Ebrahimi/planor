import fa from '../resources/js/lang/fa.js'
import { validateLogin, validateRegistration } from '../resources/js/lib/authValidation.js'
import { reviewAccount, reviewCollaborator, reviewSignup } from '../resources/js/mocks/auth.js'
import { isWorkspacePath, makeWorkspacePage } from './workspace.js'
import { createBoardHarness } from './boards.js'

const storageKey = 'planor.auth-review.v1'
const minimumPasswordLength = 12

function readSession(storage) {
  try {
    const state = JSON.parse(storage?.getItem(storageKey) || '{}')
    return {
      accountId: state?.accountId,
      signupCreated: state?.signupCreated === true,
    }
  } catch {
    return { signupCreated: false }
  }
}

function isAuthPath(pathname) {
  return pathname === '/login' || pathname === '/register'
}

function makeAuthUrl(pathname, returnTo, registrationClosed) {
  const query = new URLSearchParams()
  if (returnTo !== '/') query.set('returnTo', returnTo)
  if (registrationClosed) query.set('registration', 'closed')
  return query.size ? `${pathname}?${query}` : pathname
}

function makeAuthPage(pathname, { returnTo, registrationClosed, errors = {} }) {
  const url = makeAuthUrl(pathname, returnTo, registrationClosed)
  const props = { errors, submitUrl: url, notice: fa.auth.previewNotice }

  if (pathname === '/login') {
    return {
      component: 'Auth/Login',
      props: {
        ...props,
        allowUsername: true,
        registerUrl: registrationClosed ? '' : makeAuthUrl('/register', returnTo, false),
      },
      url,
      version: null,
    }
  }

  return {
    component: 'Auth/Register',
    props: {
      ...props,
      registrationEnabled: !registrationClosed,
      loginUrl: makeAuthUrl('/login', returnTo, registrationClosed),
      minimumPasswordLength,
    },
    url,
    version: null,
  }
}

function response(page) {
  return {
    status: 200,
    data: JSON.stringify(page),
    headers: { 'x-inertia': 'true' },
  }
}

export function createAuthHarness({ origin, storage, submitDelay = 700, clock = Date.now, reviewRetry = false, navigationDelay = 450 }) {
  const state = readSession(storage)
  const boardStore = createBoardHarness(storage, clock)
  const workspace = (url, account, errors) => makeWorkspacePage(url, account, boardStore, errors)
  let failNextNavigation = reviewRetry

  function accounts() {
    return state.signupCreated ? [reviewAccount, reviewCollaborator, reviewSignup] : [reviewAccount, reviewCollaborator]
  }

  function currentAccount() {
    return accounts().find((account) => account.id === state.accountId)
  }

  function safeReturnTo(value) {
    if (!value?.startsWith('/') || value.startsWith('//')) return '/'
    try {
      const location = new URL(value, origin)
      if (location.origin === origin && isWorkspacePath(location.pathname)) {
        return location.pathname + location.search + location.hash
      }
    } catch {
      return '/'
    }
    return '/'
  }

  function authOptions(location) {
    return {
      returnTo: safeReturnTo(location.searchParams.get('returnTo')),
      registrationClosed: location.searchParams.get('registration') === 'closed',
    }
  }

  function resolvePage(url, markRead = true) {
    const location = new URL(url, origin)
    const account = currentAccount()
    const local = location.origin === origin && !location.pathname.startsWith('//')

    if (local && isAuthPath(location.pathname)) {
      return account
        ? workspace('/', account)
        : makeAuthPage(location.pathname, authOptions(location))
    }

    const localPath = local ? location.pathname + location.search + location.hash : '/'
    const cardRoute = markRead && account && local && location.pathname.match(/^\/cards\/([A-Za-z\d_-]+)\/?$/u)
    if (cardRoute) boardStore.openCard(account.id, cardRoute[1])
    return account
      ? workspace(localPath, account)
      : makeAuthPage('/login', { returnTo: safeReturnTo(localPath) })
  }

  function beginSession(account) {
    if (account === reviewSignup) state.signupCreated = true
    state.accountId = account.id
    try {
      storage?.setItem(storageKey, JSON.stringify(state))
    } catch {
      // Keep the tab usable when storage is disabled.
    }
  }

  async function request({ method, url, data, signal }) {
    const location = new URL(url, origin)
    if (location.origin !== origin) throw new Error('Unsupported auth harness destination')
    if (method === 'get') {
      if (failNextNavigation && currentAccount() && !signal?.aborted) {
        failNextNavigation = false
        if (navigationDelay > 0) await new Promise((resolve) => setTimeout(resolve, navigationDelay))
        if (!signal?.aborted) throw new Error('Local review transport interruption')
      }
      return response(resolvePage(url, !signal?.aborted))
    }

    const route = location.pathname
    if (route === '/logout' && method === 'post') {
      if (signal?.aborted) return response(resolvePage('/login', false))
      storage?.setItem(storageKey, JSON.stringify({ signupCreated: state.signupCreated }))
      delete state.accountId
      return response({ ...resolvePage('/login'), clearHistory: true })
    }
    if (route === '/notifications/manage' && method === 'patch') {
      const back = safeReturnTo(location.searchParams.get('returnTo') || '/notifications')
      const account = currentAccount()
      if (!account || signal?.aborted) return response(resolvePage(back, false))
      return response(workspace(back, account, boardStore.changeInbox(account.id, data)))
    }
    if (route.includes('/manage/')) {
      const account = currentAccount()
      const [boardUrl, action] = route.split('/manage/')
      const back = action.startsWith('archive/') ? boardUrl + '/archive' : boardUrl
      if (!account || signal?.aborted) return response(resolvePage(back, false))
      const result = await boardStore.mutate(account.id, location, method, data, signal)
      if (currentAccount() !== account || signal?.aborted) return response(resolvePage(back, false))
      if (result) return response(workspace(result.url, account, result.errors))
    }
    if (method !== 'post' || !isAuthPath(route)) throw new Error('Unsupported auth harness request')
    if (submitDelay > 0) await new Promise((resolve) => setTimeout(resolve, submitDelay))
    if (signal?.aborted || currentAccount()) return response(resolvePage(url))

    const options = authOptions(location)
    const password = typeof data?.password === 'string' ? data.password : ''
    let account
    let errors

    if (route === '/login') {
      const identifier = typeof data?.identifier === 'string' ? data.identifier.trim().toLowerCase() : ''
      errors = validateLogin({ identifier, password }, true)
      if (!Object.keys(errors).length) {
        account = accounts().find((item) =>
          (item.email === identifier || item.username === identifier) && item.password === password,
        )
        if (!account) errors.credentials = fa.auth.errors.credentials
      }
    } else {
      if (options.registrationClosed) return response(makeAuthPage(route, options))
      const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : ''
      errors = validateRegistration({ email, password, consent: data?.consent === true }, minimumPasswordLength)
      if (!Object.keys(errors).length) {
        if (accounts().some((item) => item.email === email)) {
          errors.email = fa.auth.errors.duplicateEmail
        } else if (email !== reviewSignup.email || password !== reviewSignup.password) {
          errors.form = fa.auth.errors.reviewRegistration
        } else {
          account = reviewSignup
        }
      }
    }

    if (!account) return response(makeAuthPage(route, { ...options, errors }))

    beginSession(account)
    return response(resolvePage(options.returnTo))
  }

  return { resolvePage, request }
}
