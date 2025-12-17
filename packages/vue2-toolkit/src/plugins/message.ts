/**
 * 统一消息提示插件
 * 解决项目中127处消息提示不一致的问题
 */

interface MessageOptions {
  message: string
  duration?: number
  showClose?: boolean
  onClose?: () => void
}

class MessagePlugin {
  private Vue: any

  install(Vue: any) {
    this.Vue = Vue

    // 挂载到 Vue 原型
    Vue.prototype.$message = this.createMessage()
  }

  private createMessage() {
    const message = (options: string | MessageOptions) => {
      const opts = typeof options === 'string' ? { message: options } : options
      
      // 这里可以调用 Element UI 的 Message
      // 或者实现自己的消息提示
      if (this.Vue.prototype.$ELEMENT && this.Vue.prototype.$ELEMENT.Message) {
        this.Vue.prototype.$ELEMENT.Message(opts)
      } else {
        console.log('[Message]:', opts.message)
      }
    }

    // 成功提示
    message.success = (msg: string, duration: number = 3000) => {
      message({
        message: msg,
        duration,
        // type: 'success' // Element UI 属性
      })
    }

    // 错误提示
    message.error = (msg: string, duration: number = 3000) => {
      message({
        message: msg,
        duration,
        // type: 'error'
      })
    }

    // 警告提示
    message.warning = (msg: string, duration: number = 3000) => {
      message({
        message: msg,
        duration,
        // type: 'warning'
      })
    }

    // 信息提示
    message.info = (msg: string, duration: number = 3000) => {
      message({
        message: msg,
        duration,
        // type: 'info'
      })
    }

    return message
  }
}

export default new MessagePlugin()
