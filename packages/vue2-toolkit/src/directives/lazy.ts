import { DirectiveOptions } from 'vue'

/**
 * 图片懒加载指令
 * 使用方法: v-lazy="imageUrl"
 */
const lazy: DirectiveOptions = {
  bind(el, binding) {
    const img = el as HTMLImageElement
    const imgSrc = binding.value
    
    // 设置默认占位图
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
    
    // 如果不支持 IntersectionObserver，直接加载图片
    if (!('IntersectionObserver' in window)) {
      img.src = imgSrc
      return
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = new Image()
          image.onload = () => {
            img.src = imgSrc
            observer.unobserve(img)
          }
          image.onerror = () => {
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCI+PC9yZWN0Pjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWQgRmFpbGVkPC90ZXh0Pjwvc3ZnPg=='
          }
          image.src = imgSrc
        }
      })
    }, {
      rootMargin: '50px'
    })
    
    observer.observe(img)
    img._lazyObserver = observer
  },
  
  update(el, binding) {
    const img = el as HTMLImageElement
    if (binding.oldValue !== binding.value) {
      img.src = binding.value
    }
  },
  
  unbind(el: any) {
    // 组件销毁时取消观察
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
      el._lazyObserver = null
    }
  }
}

export default lazy
