import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import pinia from './store'
import { setupPermissionDirective } from './directives/permission'

import 'element-plus/dist/index.css'
import 'nprogress/nprogress.css'
import './styles/index.scss'

const app = createApp(App)

app.use(pinia)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(router)
setupPermissionDirective(app)

app.mount('#app')
