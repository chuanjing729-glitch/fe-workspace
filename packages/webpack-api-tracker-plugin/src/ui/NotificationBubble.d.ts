export declare class NotificationBubble {
    private bubbleElement;
    private panelElement;
    private isVisible;
    constructor();
    private init;
    private addStyles;
    private addEventListeners;
    showChanges(changes: any[]): void;
    private createChangeItem;
    togglePanel(): void;
    showPanel(): void;
    hidePanel(): void;
    updateCount(count: number): void;
    destroy(): void;
}
//# sourceMappingURL=NotificationBubble.d.ts.map