import { createApp, h } from 'vue'
import '../resources/css/app.css'
import { createInertiaApp } from '../resources/js/lib/inertia.js'
import { workspacePage } from '../resources/js/mocks/workspace.js'

const pages = import.meta.glob('../resources/js/Pages/**/*.vue')

createInertiaApp({
  page: workspacePage,
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
