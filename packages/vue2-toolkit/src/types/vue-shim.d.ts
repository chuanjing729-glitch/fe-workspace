import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    // Event Manager
    $_eventListeners: any[]
    $_addEventListener(target: EventTarget, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void
    $_on(bus: any, event: string, handler: Function): void
    $_off(bus: any, event: string, handler: Function): void
    $_removeEventListener(target: EventTarget, event: string, handler: EventListener): void
    $_clearAllListeners(): void
    
    // Observer Manager
    $_observers: any[]
    $_createResizeObserver(target: Element, callback: ResizeObserverCallback): ResizeObserver | null
    $_createIntersectionObserver(target: Element, callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver | null
    $_createMutationObserver(target: Node, callback: MutationCallback, options?: MutationObserverInit): MutationObserver | null
    $_disconnectObserver(observer: any): void
    $_disconnectAllObservers(): void
    
    // Permission Manager
    $_userPermissions: string[]
    $_userRoles: string[]
    $_hasPermission(permissions: string | string[]): boolean
    $_hasRole(roles: string | string[]): boolean
    $_hasAnyPermission(permissions: string[]): boolean
    $_hasAllPermissions(permissions: string[]): boolean
    $_checkPermission(permissions: string | string[], callback?: () => void, fallback?: () => void): void
    $_checkRoutePermission(route: any): boolean
    
    // Timer Manager
    $_timers: number[]
    $_intervals: number[]
    $_setTimeout(fn: Function, delay?: number): number | undefined
    $_setInterval(fn: Function, interval: number): number | undefined
    $_clearTimeout(timerId: number): void
    $_clearInterval(intervalId: number): void
    $_clearAllTimers(): void
    $_debounceTimeout(fn: Function, delay?: number): number | undefined
  }
}