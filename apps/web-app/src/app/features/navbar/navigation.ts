export interface NavigationGroup {
    text: string,
    path: string,
    items: NavigationItem[],
    condition?: (context: NavigationConditionContext) => boolean
}

export interface NavigationItem {
    text: string,
    path: string,
    default?: boolean,
    condition?: (context: NavigationConditionContext) => boolean
}

export interface NavigationConditionContext {
    isLeader: boolean
}
