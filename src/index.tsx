// import { util } from 'biz-lib';
import React, { Component } from 'react';
// import Icon from '../_common/icon';
import { IScroll, IScrollProps, IScrollState, TDirection, TPoint } from './types';
import { animate, caclDirection, caclVelocity,debounce } from './util';

const _SPEED = 1.5;
const _INDICATE_WIDITH = 10;
const _INDICATE_HOVER_WIDITH = 15;
const _REAL_VELOCITY_TIMESPAN = 150;

const defaultProps = {
    mode: 'both',
    indicate: {
        hidden: false,
        width: _INDICATE_WIDITH,
        hoverWidth: _INDICATE_HOVER_WIDITH,
    },
    hoverButton: {
        hidden: true,
    },
    animate: {
        hidden: false,
        speed: _SPEED,
    },
    disabled: false,
}

/**
 * @visibleName Scroll 滚动条
 */
class Scroll extends Component<IScrollProps, IScrollState> implements IScroll {
    public static defaultProps = defaultProps
    public startPoint: TPoint = { x: 0, y: 0 };
    public endPoint: TPoint;
    public lastX: number = 0;
    public lastY: number = 0;

    public isDraging = false;
    public timer;
    public loop: any;
    public lastPos: TPoint;
    public lastTime: number;
    public startTime: number;
    public caclReal: { destroy(): void; };
    public running = false;
    public lastDirection;
    public isWheelRoll = false
    public isIndicateOver = false
    constructor(props, context) {
        super(props, context);
        const me = this;

        me.state = {
            scrollLeft: 0,
            scrollTop: 0,
            scrollHeight: 0,
            scrollWidth: 0,
            clientHeight: 0,
            clientWidth: 0,
            maxXOffset: 0,
            maxYOffset: 0,
            xIndicateLength: 0,
            yIndicateLength: 0,
            xIndicateWidth: 0,// props.indicate.width,
            yIndicateWidth: 0,// props.indicate.width,
            xIndicateTrackLength: 0,
            yIndicateTrackLength: 0,
        }
        me.onWheelStop = debounce(me.onWheelStop, 200);
    }
    public componentDidMount() {
        this.refresh();
    }
    // public componentDidUpdate() {
    //     const me = this;
    //     console.log('componentDidUpdate')
    //     // me.resetScrollSize(me.props);
    // }
    public componentWillReceiveProps(nextProps) {
        const me = this;
        const nextState: any = {};
        if (nextProps.hasOwnProperty('scrollLeft') && typeof nextProps.scrollLeft !== 'undefined') {
            nextState.scrollLeft = nextProps.scrollLeft;
            // me.lastX = nextProps.scrollLeft;
        }
        if (nextProps.hasOwnProperty('scrollTop') && typeof nextProps.scrollTop !== 'undefined') {
            nextState.scrollTop = nextProps.scrollTop;
            // me.lastY = nextProps.scrollTop;
        }
        if (nextProps.hasOwnProperty('scrollWidth') || nextProps.hasOwnProperty('scrollHeight')) {

            if (me.props.scrollWidth !== nextProps.scrollWidth
                || me.props.scrollHeight !== nextProps.scrollHeight
            ) {
                me.resetScrollSize(nextProps);
            }
        }
        me.setState(nextState);
    }
    public scrollTo = (left: number, top: number) => {
        const me = this;
        me.setScroll(left, top)
    }
    public scrollBy = (left: number, top: number) => {
        const me = this;
        const l = me.getScrollLeft() as number;
        const t = me.getScrollTop() as number;
        me.setScroll(l + left, t + top);
    }
    public get scrollLeft() {
        return this.getScrollLeft() as number;
    }
    public set scrollLeft(value: number) {
        this.setScrollLeft(value);
    }
    public get scrollTop() {
        return this.getScrollTop() as number;
    }
    public set scrollTop(value) {
        this.setScrollTop(value);
    }
    public getScrollLeft() {
        const me = this;
        // 受控组件
        if (me.props.hasOwnProperty('scrollLeft')) {
            return me.props.scrollLeft;
        } else {
            return me.state.scrollLeft;
        }
    }
    public setScroll(scrollLeft, scrollTop) {
        const me = this;
        const {
            maxXOffset,
            maxYOffset,
        } = me.state;

        let left = scrollLeft;
        if (scrollLeft >= 0) {
            left = 0;
        } else if (left <= -maxXOffset) {
            left = -maxXOffset;
        }

        let top = scrollTop;
        if (scrollTop >= 0) {
            top = 0;
        } else if (top <= -maxYOffset) {
            top = -maxYOffset;
        }

        // 受控组件
        if (me.props.hasOwnProperty('scrollLeft') || me.props.hasOwnProperty('scrollTop')) {
            me.trigerOnScroll({ scrollLeft: left, scrollTop: top })
        } else {
            me.setState((state) => {
                const nextState: IScrollState = state;
                nextState.scrollLeft = left;
                nextState.scrollTop = top;
                return state;
            }, () => {
                me.trigerOnScroll({
                    scrollLeft: me.state.scrollLeft,
                    scrollTop: me.state.scrollTop,
                })
            })
        }
    }
    public setScrollLeft(scrollLeft) {
        const me = this;
        const {
            mode = 'horizontal',
        } = me.props;
        const scrollTop = me.getScrollTop();
        const left = mode === 'vertical' ? 0 : scrollLeft;
        me.setScroll(left, scrollTop);
    }
    public getScrollTop() {
        const me = this;
        // 受控组件
        if (me.props.hasOwnProperty('scrollTop')) {
            return me.props.scrollTop;
        } else {
            return me.state.scrollTop;
        }
    }
    public setScrollTop(scrollTop) {
        const me = this;
        const {
            mode = 'horizontal',
        } = me.props;
        const scrollLeft = me.getScrollLeft();
        const top = mode === 'horizontal' ? 0 : scrollTop;
        me.setScroll(scrollLeft, top);
    }
    /**
     * 启动即时速度计算
     */
    public startCaclRealV = () => {
        const me = this;
        const t = _REAL_VELOCITY_TIMESPAN;
        const timer = setInterval(() => {
            if (!me.isDraging) {
                // me.lastPos = me.endPoint;
                clearInterval(timer);
                return;
            }
            if (!me.lastPos) {
                me.lastTime = Date.now();
                me.lastPos = me.endPoint;
                return;
            }
            // const xdist = Math.abs(me.endPoint.x - me.lastPos.x);
            // const ydist = Math.abs(me.endPoint.y - me.lastPos.y);
            // me.realXVelocity = caclVelocity(xdist, time);
            // me.realYVelocity = caclVelocity(ydist, time);
            me.lastTime = Date.now();
            me.lastPos = me.endPoint;
        }, t);
        return {
            destroy() {
                clearInterval(timer);
            },
        }
    }
    /**
     * 计算即时速度
     */
    public caclRealV = () => {
        const me = this;
        if (!me.lastPos) {
            return {
                realXVelocity: 0,
                realYVelocity: 0,
            }
        }
        const time = (Date.now() - me.lastTime) / 1000;
        const xdist = Math.abs(me.endPoint.x - me.lastPos.x);
        const ydist = Math.abs(me.endPoint.y - me.lastPos.y);
        return {
            realXVelocity: caclVelocity(xdist, time),
            realYVelocity: caclVelocity(ydist, time),
        }
    }
    /**
     * 重新计算滚动区域和滚动条大小
     */
    public refresh = () => {
        const me = this;
        me.resetScrollSize(me.props);
    }
    public resetScrollSize = (props) => {
        const me = this;
        const {
            clientWidth,
            scrollWidth,
            clientHeight,
            scrollHeight,
        } = me.state;
        const size = me.getScrollSize(props);

        if (clientWidth === size.clientWidth &&
            clientHeight === size.clientHeight &&
            scrollHeight === size.scrollHeight &&
            scrollWidth === size.scrollWidth) {
            return;
        }

        const params = me.caclScrollParams(size);
        // console.log(params)
        me.setState({
            ...size,
            ...params,
        });
    }
    public getScrollSize = (props) => {
        const me = this;
        const propsSclWidth = props.scrollWidth || 'auto';
        const propsSclHeight = props.scrollHeight || 'auto';
        // const propsCltWidth = props.width || 'auto';
        // const propsCltHeight = props.height || 'auto';
        const wrap = me.refs.wrap as HTMLElement;
        const body = me.refs.body as HTMLElement;

        // 容器计算
        // 如果 clientHeight 和 scrollHeight 都是设置了 auto，那么高度按子元素设置
        // 如果 clientHeight 是 auto 和 scrollHeight 设置 都是设置了 auto
        // const wrapParent = (wrap.parentElement as HTMLElement);
        const bodyDom = (body.firstElementChild as HTMLElement || body);
        const bodyWidth = bodyDom.offsetWidth;
        const bodyHeight = bodyDom.offsetHeight;
        // const clientWidth = (propsCltWidth === 'auto' || !propsCltWidth) ? wrap.offsetWidth : propsCltWidth;
        // const clientHeight = (propsCltHeight === 'auto' || !propsCltHeight) ? wrap.offsetHeight : propsCltHeight;
        const clientWidth = wrap.offsetWidth;
        const clientHeight = wrap.offsetHeight;

        const scrollWidth = (propsSclWidth === 'auto' || !propsSclWidth) ? bodyWidth : propsSclWidth as number;
        const scrollHeight = (propsSclHeight === 'auto' || !propsSclHeight) ? bodyHeight : propsSclHeight as number;
        const data = {
            clientWidth,
            clientHeight,
            scrollWidth,
            scrollHeight,
        }
        // console.log(data)
        return data;
    }
    public caclScrollParams = (size) => {
        const me = this;
        const {
            mode,
            indicate = defaultProps.indicate,
        } = me.props;
        let xIndicateWidth = indicate.width as number;
        let yIndicateWidth = indicate.width as number;
        const maxXOffset = size.scrollWidth - size.clientWidth;
        const maxYOffset = size.scrollHeight - size.clientHeight;

        if (maxXOffset <= 0) {
            xIndicateWidth = 0;
        }
        if (maxYOffset <= 0) {
            yIndicateWidth = 0;
        }
        const isBoth = mode === 'both' && maxXOffset > 0 && maxYOffset > 0;
        const xIndicateTrackLength = isBoth ? size.clientWidth - xIndicateWidth : size.clientWidth;
        const yIndicateTrackLength = isBoth ? size.clientHeight - yIndicateWidth : size.clientHeight;

        const xIndicateLength = maxXOffset <= 0 ? 0 : (xIndicateTrackLength / size.scrollWidth) * xIndicateTrackLength;
        const yIndicateLength = maxYOffset <= 0 ? 0 : (yIndicateTrackLength / size.scrollHeight) * yIndicateTrackLength;
        return {
            maxXOffset: maxXOffset > 0 ? maxXOffset : 0,
            maxYOffset: maxYOffset > 0 ? maxYOffset : 0,
            xIndicateLength,
            yIndicateLength,
            xIndicateWidth,
            yIndicateWidth,
            yIndicateTrackLength,
            xIndicateTrackLength,
        }
    }
    public trigerOnScroll = ({ scrollLeft, scrollTop }) => {
        const me = this;
        const {
            onScroll = () => void 0,
        } = me.props;
        const {
            scrollWidth = 0,
            clientWidth = 0,
            scrollHeight = 0,
            clientHeight = 1,
        } = me.state;

        onScroll({
            target: {
                scrollLeft,
                scrollRight: (scrollWidth - clientWidth) + scrollLeft,
                scrollTop,
                scrollBottom: (scrollHeight - clientHeight) - scrollTop,
            },
        })
    }

    public getIndicateLeft(scrollLeft: number) {
        const me = this;
        const {
            scrollWidth = 0,
            clientWidth = 1,
        } = me.state;

        return (-scrollLeft / scrollWidth) * clientWidth;
    }
    public getIndicateTop(scrollTop: number) {
        const me = this;
        const {
            scrollHeight = 0,
            clientHeight = 1,
        } = me.state;
        return (-scrollTop / scrollHeight) * clientHeight;
    }
    public clearEvents() {
        const me = this;
        document.removeEventListener('mousemove', me.onMouseMove);
        document.removeEventListener('mouseup', me.onMouseUp);
    }
    public onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // tslint:disable-next-line: no-console
        // //console.log('onMouseDown', e.clientX);
        const me = this;
        const {
            maxXOffset,
            maxYOffset,
        } = me.state;

        if (maxXOffset === 0 && maxYOffset === 0) {
            return;
        }

        me.startPoint = {
            x: e.clientX,
            y: e.clientY,
        }
        me.isDraging = true;
        me.lastX = me.getScrollLeft() || 0;
        me.lastY = me.getScrollTop() || 0;
        me.caclReal = me.startCaclRealV();
        if (me.loop) {
            me.loop.destroy();
        }
        document.addEventListener('mousemove', me.onMouseMove);
        document.addEventListener('mouseup', me.onMouseUp);

    }
    public onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
        // console.log('onMouseMove');
        const me = this;
        const {
            mode = 'horizontal',
        } = me.props;
        const {
            maxXOffset,
            maxYOffset,
        } = me.state;
        if (!me.isDraging) {
            return;
        }

        me.endPoint = {
            x: e.clientX,
            y: e.clientY,
        }

        const direction = caclDirection(me.startPoint, me.endPoint);
        // const maxDist = me.caclMaxDist();
        if (direction === 'left' || direction === 'right') {
            if (mode === 'vertical') {
                return;
            }
            if (maxXOffset === 0) {
                return;
            }
            const offset = me.endPoint.x - me.startPoint.x;
            if (offset === 0) {
                return;
            }
            const scrollLeft = me.lastX + offset;
            me.setScrollLeft(scrollLeft);
        } else {
            if (mode === 'horizontal') {
                return;
            }
            if (maxYOffset === 0) {
                return;
            }
            const offset = me.endPoint.y - me.startPoint.y;
            if (offset === 0) {
                return;
            }
            const scrollTop = me.lastY + offset;
            me.setScrollTop(scrollTop);
        }

    }
    public onMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
        // console.log('onMouseUp', e.clientX);
        const me = this;
        // me.start=e.clientX;
        const animateSet = me.props.animate;
        const {
            maxXOffset, maxYOffset,
        } = me.state;

        me.isDraging = false;
        me.caclReal.destroy();

        if (animateSet.hidden) {
            me.clearEvents();
            return;
        }

        me.lastX = me.getScrollLeft() || 0;
        me.lastY = me.getScrollTop() || 0;
        me.endPoint = {
            x: e.clientX,
            y: e.clientY,
        }

        const {
            realXVelocity,
            realYVelocity,
        } = me.caclRealV();

        const speed = animateSet.speed * 1000;
        const direction = caclDirection(me.startPoint, me.endPoint);
        if (realXVelocity <= 20 && realYVelocity <= 20) {
            return;
        }
        // console.log('direction', direction);
        if ((direction === 'left' || direction === 'right') && realXVelocity > 0) {
            const dircect = direction === 'left' ? -1 : 1;
            me.loop = animate(realXVelocity, speed, (dist) => {
                const scrollLeft = me.lastX + dircect * dist;
                if (scrollLeft <= -maxXOffset) {
                    me.setScrollLeft(-maxXOffset)
                    return false;
                } else if (scrollLeft >= 0) {
                    me.setScrollLeft(0);
                    return false;
                }
                me.setScrollLeft(scrollLeft);
                return true;
            }, () => {
                me.lastX = me.getScrollLeft() || 0;
            })
        } else if ((direction === 'top' || direction === 'bottom') && realYVelocity > 0) {
            const dircect = direction === 'top' ? -1 : 1;
            me.loop = animate(realYVelocity, speed, (dist) => {
                const scrollTop = me.lastY + dircect * dist;
                if (Math.abs(scrollTop) >= maxYOffset) {
                    me.setScrollTop(-maxYOffset)
                    return false;
                } else if (scrollTop >= 0) {
                    me.setScrollTop(0);
                    return false;
                }
                me.setScrollTop(scrollTop);
                return true;
            }, () => {
                me.lastY = me.getScrollTop() || 0;
            })
        }

        me.clearEvents();
    }
    public moveOnWheel = (direction: TDirection) => {
        const me = this;
        if (me.lastDirection !== direction || me.isWheelRoll === false) {
            if (me.loop) {
                me.loop.destroy();
            }
        }
        me.lastDirection = direction;
        if (me.running) {
            return;
        }
        me.running = true;
        const {
            maxXOffset,
            maxYOffset,
        } = me.state;
        if (direction === 'left' || direction === 'right') {
            me.moveOnWheelX(direction, maxXOffset);
        } else {
            me.moveOnWheelY(direction, maxYOffset);
        }
    }
    public moveOnWheelX = (direction: TDirection, maxXOffset) => {
        const me = this;
        const dir = direction === 'left' ? -1 : 1;
        me.loop = animate(500, 0, (dist) => {
            if (me.isWheelRoll === false) {
                return false;
            }
            const scrollLeft = me.lastX + dir * dist;
            if (scrollLeft <= -maxXOffset) {
                me.running = false;
                me.setScrollLeft(-maxXOffset);
                return false;
            }
            if (scrollLeft >= 0) {
                me.running = false;
                me.setScrollLeft(0);
                return false;
            }
            me.setScrollLeft(scrollLeft);
            return true;
        }, () => {
            me.running = false;
            me.lastX = me.getScrollLeft() || 0;
        })
    }
    public moveOnWheelY = (direction: TDirection, maxYOffset) => {
        const me = this;
        const dir = direction === 'top' ? -1 : 1;
        me.loop = animate(500, 0, (dist) => {
            if (me.isWheelRoll === false) {
                return false;
            }
            const scrollTop = me.lastY + dir * dist;
            if (scrollTop <= -maxYOffset) {
                me.running = false;
                me.setScrollTop(-maxYOffset);
                return false;
            }
            if (scrollTop >= 0) {
                me.running = false;
                me.setScrollTop(0);
                return false;
            }
            me.setScrollTop(scrollTop);
            return true;
        }, () => {
            me.running = false;
            me.lastY = me.getScrollTop() || 0;
        })
    }
    public onWheelStop = () => {
        this.isWheelRoll = false;
    }
    public onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const me = this;
        const {
            indicate: {
                hidden,
            },
            disabled,
        } = me.props;

        if (disabled || hidden) {
            return;
        }

        // e.preventDefault();
        e.stopPropagation();
        // e.nativeEvent.preventDefault();
        // e.nativeEvent.stopPropagation();
        // e.nativeEvent.stopImmediatePropagation();

        me.isWheelRoll = true;
        me.onWheelStop();
        const { deltaX, deltaY } = e;
        if (deltaX !== 0) {
            // 左右滚动
            const direction: TDirection = deltaX > 0 ? 'left' : 'right';
            me.moveOnWheel(direction)
        }
        if (deltaY !== 0) {
            // 上下滚动
            const direction: TDirection = deltaY > 0 ? 'top' : 'bottom';
            me.moveOnWheel(direction)
        }

    }
    public onIndicateDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        const me = this;
        me.isDraging = true;
        me.startPoint = {
            x: e.clientX,
            y: e.clientY,
        }
        me.lastX = me.getScrollLeft() || 0;
        me.lastY = me.getScrollTop() || 0;
        me.caclReal = me.startCaclRealV();
        if (me.loop) {
            me.loop.destroy();
        }
        // me.onIndicateOver();
        document.addEventListener('mousemove', me.onIndicateMove)
        document.addEventListener('mouseup', me.onIndicateUp)
    }
    public onIndicateMove = (e) => {
        // e.stopPropagation();
        // console.log('onMouseMove');
        const me = this;
        if (!me.isDraging) {
            return;
        }

        me.endPoint = {
            x: e.clientX,
            y: e.clientY,
        }
        const {
            scrollWidth = 0,
            // clientWidth = 1,
            scrollHeight = 0,
            // clientHeight = 1,
            xIndicateTrackLength,
            yIndicateTrackLength,
        } = me.state;

        const direction = caclDirection(me.startPoint, me.endPoint);

        if (direction === 'left' || direction === 'right') {
            const rate = xIndicateTrackLength / scrollWidth;
            const offset = me.endPoint.x - me.startPoint.x;
            if (offset === 0) {
                return;
            }
            const scrollLeft = me.lastX - offset / rate;
            me.setScrollLeft(scrollLeft);
        } else {
            const rate = yIndicateTrackLength / scrollHeight;
            const offset = me.endPoint.y - me.startPoint.y;
            if (offset === 0) {
                return;
            }
            const scrollTop = me.lastY - offset / rate;
            me.setScrollTop(scrollTop);
        }
    }
    public onIndicateUp = (e) => {
        // e.stopPropagation();
        const me = this;
        // console.log('onMouseUp', e.clientX);

        me.isDraging = false;
        me.caclReal.destroy();
        me.lastX = me.getScrollLeft() || 0;
        me.lastY = me.getScrollTop() || 0;
        me.endPoint = {
            x: e.clientX,
            y: e.clientY,
        }
        me.closeIndicate();
        document.removeEventListener('mousemove', me.onIndicateMove);
        document.removeEventListener('mouseup', me.onIndicateUp);
    }
    public onIndicateOver = (e) => {
        const me = this;
        if (me.isIndicateOver) {
            return;
        }
        const {
            indicate: {
                hoverWidth = 15,
            } = defaultProps.indicate,
        } = me.props;
        const { currentTarget } = e;
        const position = currentTarget.getAttribute('data-position');
        if (position === 'bottom') {
            me.setState({
                xIndicateWidth: hoverWidth,
            })
        } else if (position === 'right') {
            me.setState({
                yIndicateWidth: hoverWidth,
            })
        }
        me.isIndicateOver = true;

    }
    public onIndicateOut = (_e) => {
        const me = this;
        if (me.isDraging) {
            return;
        }
        me.closeIndicate()
    }
    public closeIndicate() {
        const me = this;
        if (me.isDraging) {
            return;
        }
        const {
            xIndicateWidth,
            yIndicateWidth,
        } = me.state;
        const {
            indicate: {
                width = 10,
            } = {},
        } = me.props;
        const nextState: any = {};
        if (xIndicateWidth > 0) {
            nextState.xIndicateWidth = width;
        }
        if (yIndicateWidth > 0) {
            nextState.yIndicateWidth = width;
        }
        me.setState(nextState);
        me.isIndicateOver = false;
    }
    public onIndicateWrapDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const me = this;
        const {
            xIndicateLength,
            yIndicateLength,
            xIndicateTrackLength,
            yIndicateTrackLength,
            scrollWidth = 1,
            scrollHeight = 1,
        } = me.state;
        const { currentTarget } = e;
        const position = currentTarget.getAttribute('data-position');
        if (position === 'bottom') {
            const rate = xIndicateTrackLength / scrollWidth;
            const { clientX } = e;
            const scrollLeft = me.getScrollLeft() as number;
            const indicateLeft = me.getIndicateLeft(scrollLeft);
            if (clientX < indicateLeft) {
                const offsetLeft = (indicateLeft - clientX + xIndicateLength / 2) / rate;
                me.scrollBy(offsetLeft, 0);

            } else if (clientX > indicateLeft + xIndicateLength) {
                const offsetLeft = (clientX - indicateLeft - xIndicateLength / 2) / rate;
                me.scrollBy(-offsetLeft, 0);
            }

        } else if (position === 'right') {
            const rate = yIndicateTrackLength / scrollHeight;
            const { clientY } = e;
            const scrollTop = me.getScrollTop() as number;
            const indicateTop = me.getIndicateTop(scrollTop);
            if (clientY < indicateTop) {
                const offsetTop = (indicateTop - clientY + yIndicateLength / 2) / rate;
                me.scrollBy(0, offsetTop);
            } else if (clientY > indicateTop + yIndicateLength) {
                const offsetTop = (clientY - indicateTop - yIndicateLength / 2) / rate;
                me.scrollBy(0, -offsetTop);
            }
        }
    }
    public renderIndicateBottom() {
        const me = this;
        const {
            mode,
            indicate = {
                hidden: false,
                width: _INDICATE_WIDITH,
                hoverWidth: _INDICATE_HOVER_WIDITH,
            },
        } = me.props;
        const {
            xIndicateLength,
            xIndicateWidth,
            xIndicateTrackLength,
        } = me.state;
        const scrollLeft = me.getScrollLeft();
        const indicateLeft = me.getIndicateLeft(scrollLeft || 0);

        if ((mode === 'horizontal' || mode === 'both')
            && !indicate.hidden
            && xIndicateWidth > 0) {
            return (
                <div className={`biz-scroll_indicate-wrap horizontal`}
                    style={{
                        height: xIndicateWidth,
                        width: xIndicateTrackLength,
                    }}
                    data-position="bottom"
                    onMouseDown={me.onIndicateWrapDown}
                    onMouseOver={me.onIndicateOver}
                    onMouseOut={me.onIndicateOut}
                >
                    <div className={`indicate horizontal`}
                        onMouseDown={me.onIndicateDown}
                        style={{
                            width: xIndicateLength,
                            height: xIndicateWidth,
                            transform: `translate3d(${indicateLeft}px,0,0)`,
                        }}
                    >
                    </div>
                </div>
            )
        }
        return null;
    }
    public renderIndicateRight() {
        const me = this;
        const {
            mode,
            indicate = defaultProps.indicate,
        } = me.props;
        const {
            yIndicateWidth,
            yIndicateLength,
            yIndicateTrackLength,
        } = me.state;
        const scrollTop = me.getScrollTop();
        const indicateTop = me.getIndicateTop(scrollTop || 0);
        if ((mode === 'vertical' || mode === 'both')
            && !indicate.hidden
            && yIndicateWidth > 0
        ) {
            return (
                <div className={`biz-scroll_indicate-wrap vertical`}
                    style={{
                        width: yIndicateWidth,
                        height: yIndicateTrackLength,
                    }}
                    data-position="right"
                    onMouseDown={me.onIndicateWrapDown}
                    onMouseOver={me.onIndicateOver}
                    onMouseOut={me.onIndicateOut}
                >
                    <div className={`indicate vertical`}
                        data-position="right"
                        onMouseDown={me.onIndicateDown}
                        style={{
                            height: yIndicateLength,
                            width: yIndicateWidth,
                            transform: `translate3d(0,${indicateTop}px,0)`,
                        }}
                    >
                    </div>
                </div>
            )
        }
        return null;
    }
    public onHoverBtnDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const me = this;
        const target = e.currentTarget;
        const direction = target.getAttribute('data-direction') as TDirection;
        // console.log(direction)
        me.isWheelRoll = true;
        me.moveOnWheel(direction);
    }
    public onHoverBtnUp = () => {
        this.isWheelRoll = false;
    }
    public renderHoverIndicate() {
        const me = this;
        const {
            mode,
            hoverButton: {
                hidden = true,
            },
        } = me.props;

        if (hidden) {
            return null;
        }
        const {
            scrollLeft = 0,
            scrollWidth = 0,
            clientWidth = 0,
        } = me.state;

        if (mode === 'horizontal') {

            if (scrollWidth <= clientWidth) {
                return null;
            }
            const scrollRight = (scrollWidth - clientWidth) + scrollLeft;
            // console.log(scrollRight)
            return (
                <>
                    <div
                        data-direction="right"
                        className="biz-scroll_pre-btn left"
                        onMouseDown={me.onHoverBtnDown}
                        onMouseUp={me.onHoverBtnUp}
                        style={{
                            display: scrollLeft <= -10 ? 'block' : 'none',
                            // visibility: scrollLeft <= -3 ? 'visible' : 'hidden'
                            // opacity: scrollLeft <= -10 ? 1 : 0,
                        }}
                    >
                        {/* <Icon type="arrow-left" /> */}
                    </div>
                    <div
                        data-direction="left"
                        className="biz-scroll_next-btn right"
                        onMouseDown={me.onHoverBtnDown}
                        onMouseUp={me.onHoverBtnUp}
                        style={{
                            display: scrollRight > 10 ? 'block' : 'none',
                            // visibility: scrollRight > 3 ? 'visible' : 'hidden'
                            // opacity: scrollRight > 10 ? 1 : 0,
                        }}
                    >
                        {/* <Icon type="arrow-right" /> */}
                    </div>
                </>
            )
        } else if (mode === 'vertical') {
            return (
                <>
                    <div
                        data-direction="top"
                        className="biz-scroll_pre-btn top"
                        onMouseDown={me.onHoverBtnDown}
                        onMouseUp={me.onHoverBtnUp}
                    ></div>
                    <div
                        data-direction="bottom"
                        className="biz-scroll_next-btn bottom"
                        onMouseDown={me.onHoverBtnDown}
                        onMouseUp={me.onHoverBtnUp}>

                    </div>
                </>
            )
        } else {
            console.warn('todo')
        }
    }
    public render() {
        const me = this;
        const {
            className = '',
            style = {},
            children,
            indicate = {
                hidden: false,
            },
            mode,
            width,
            height,
            disabled,
        } = me.props;

        if (disabled) {
            return (
                <div ref="wrap" className={`biz-scroll ${className}`} style={style}>
                    {children}
                </div>
            )
        }

        const {
            xIndicateWidth,
            yIndicateWidth,
            scrollWidth,
            scrollHeight,
            // clientWidth,
            // clientHeight,
        } = me.state;
        const scrollLeft = me.getScrollLeft();
        const scrollTop = me.getScrollTop();

        const rootStyle = {
            width: mode === 'vertical' ? 'auto' : (width || 'auto'),
            height: mode === 'horizontal' ? 'auto' : (height || 'auto'),
            paddingBottom: indicate.hidden ? 0 : xIndicateWidth,
            paddingRight: indicate.hidden ? 0 : yIndicateWidth,
        }
        return (
            <div ref="wrap" className={`biz-scroll ${className}`} style={{
                ...rootStyle,
                ...style,
            }}>
                <div ref="body" className="biz-scroll_body"

                    onMouseDown={me.onMouseDown}
                    onWheel={me.onWheel}
                    style={{
                        width: scrollWidth || 'auto',
                        height: scrollHeight || 'auto',
                        transform: `translate3d(${scrollLeft}px,${scrollTop}px,0)`,
                    }}
                >
                    {children}
                </div>
                {
                    me.renderIndicateBottom()
                }
                {
                    me.renderIndicateRight()
                }
                {
                    me.renderHoverIndicate()
                }
            </div>
        )
    }
}

export default Scroll;
