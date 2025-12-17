/**
 * Vue2 Toolkit 入口文件
 */

import messagePlugin from './plugins/message'
import * as directives from './directives'

// 导出插件和指令
export { messagePlugin, directives }

// 默认导出：Vue.use() 安装
export default {
  install(Vue: any) {
    // 安装消息提示插件
    Vue.use(messagePlugin)

    // 批量注册指令
    Object.keys(directives).forEach(key => {
      if (key !== 'default') {
        Vue.directive(key, (directives as any)[key])
      }
    })
  }
}
