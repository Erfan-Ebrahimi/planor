import { createApp, h } from 'vue'
import '../resources/css/app.css'
import { createInertiaApp, router } from '../resources/js/lib/inertia.js'
import { createAuthHarness } from './auth.js'

const pages = import.meta.glob('../resources/js/Pages/**/*.vue')
let storage
try {
  storage = window.sessionStorage
} catch {
  // The review session can also run in memory.
}
const initialUrl = new URL(window.location.href)
const auth = createAuthHarness({
  origin: initialUrl.origin,
  storage,
  reviewRetry: initialUrl.searchParams.get('review') === 'retry',
})
const initialPage = auth.resolvePage(window.location.href)

if (new URL(initialPage.url, window.location.origin).href !== window.location.href) {
  window.history.replaceState(window.history.state, '', initialPage.url)
}

router.on('navigate', ({ detail: { page, type } }) => {
  if (type !== 'history') return
  const resolved = auth.resolvePage(page.url)
  if (resolved.url !== page.url || resolved.component !== page.component
    || resolved.props.viewer?.id !== page.props.viewer?.id
    || resolved.props.workspaceRevision !== page.props.workspaceRevision) {
    router.visit(resolved.url, { replace: true })
  }
})

createInertiaApp({
  page: initialPage,
  http: { request: auth.request },
  progress: false,
  resolve(name) {
    return pages[`../resources/js/Pages/${name}.vue`]()
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})
