export interface IScroll {
    scrollLeft: number;
    scrollTop: number;
    /**
     * 滚动到指定位置
    */
    scrollTo: (left: number, top: number) => void;
    /**
     * 滚动相对距离
    */
    scrollBy: (left: number, top: number) => void;
    /**
     * 重新计算滚动区域
    */
    refresh: () => void;
}

export interface IScrollEvent {
    target: {
        scrollLeft: number;
        scrollTop: number;
        scrollRight: number;
        scrollBottom: number;
    };
}

export interface IScrollProps {
    /**
     * 附加到容器的 CSS Class
     */
    className?: string;
    /**
     * 附加都容器的 Style 样式
     */
    style?: React.CSSProperties;
    /**
     * 模式
     */
    mode?: 'horizontal' | 'vertical' | 'both';
    /**
     * 可视区域的宽度，默认等于容器宽度
     */
    width?: number | 'auto' | '100%';
    /**
     * 可视区域的高度，默认是容器的高度
     */
    height?: number | 'auto' | '100%';
    /**
     * 内容取宽度，默认 auto 取子节点宽度
     */
    scrollWidth?: number | 'auto';
    /**
     * 滚动区高度，默认 auto 取父容器高度
     */
    scrollHeight?: number | 'auto';
    /**
     * 滚动条距离左侧的距离
     */
    scrollLeft?: number;
    /**
     * 滚动条距离顶部距离
     */
    scrollTop?: number;
    /**
     * 滚动条指示器设置
     */
    indicate?: {
        hidden?: boolean,
        width?: number,
        hoverWidth?: number,
    };
    /**
     * 滚动控制导航按钮，鼠标点击后开始滚动，松开后停止
     * 
     */
    hoverButton: {
        // 是否隐藏
        hidden?: boolean,
        // 按钮样式
        style?: React.CSSProperties;
    };
    /**
     * 动画设置
     * hidden 是否隐藏滚动条
     * speed 滚动过程的减速度，默认值是 1.5
     */
    animate: {
        hidden?: boolean,
        speed: number,
    },
    /**
     * 是否禁用滚动条
     */
    disabled: boolean;
    /**
     * 滚动事件
     */
    onScroll?: (e: IScrollEvent) => void;
    /**
     * 滚动条滚动到开始位置 // TODO
     */
    onBegin?: () => void;
    /**
     * 滚动滚动条末尾位置 // TODO
     */
    onEnd?: () => void;
}

export interface IScrollState {
    /**
     * 滚动条左侧距离
     */
    scrollLeft?: number;
    /**
     * 滚动条顶部距离
     */
    scrollTop?: number;
    /**
     * 滚动区域高度
     */
    scrollHeight?: number;
    /**
     * 滚动条区域宽度
     */
    scrollWidth?: number;
    /**
     * 可视区域高度
     */
    clientHeight?: number;
    /**
     * 可视区域宽度
     */
    clientWidth?: number;
    /**
     * 横向最大偏移量，不能小于0
     */
    maxXOffset: number;
    /**
     * 纵向最大偏移量，不能小于0
     */
    maxYOffset: number;
    /**
     * 横向滚动条标识长度
     */
    xIndicateLength: number,
    /**
     * 纵向滚动条标识长度
     */
    yIndicateLength: number,
    /**
     * 底部滚动条的宽度
    */
    xIndicateWidth: number,
    /**
     * 右侧滚动条的宽度
     */
    yIndicateWidth: number,

    /**
     * 底部滚动槽的长度
     */
    xIndicateTrackLength: number,
    /**
     * 右侧滚动槽的长度
     */
    yIndicateTrackLength: number,
}

export interface TPoint {
    x: number,
    y: number,
}

export type TDirection = 'top' | 'right' | 'bottom' | 'left';
