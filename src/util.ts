import { TDirection, TPoint } from './types'

/**
 * 动画执行函数
 * @param v 速度 像素/秒
 * @param a 减速度 像素/秒平方
 * @param onMove 回调函数，返回移动距离
 * @param onEnd 回调函数，终止动画
 */
export const animate = (v: number, a: number, onMove: (dist) => boolean, onEnd: () => any): { destroy: () => void } => {
    const t = 16;// ms
    const start = Date.now();
    return loopByFrame(t, () => {
        const time = (Date.now() - start) / 1000;
        if (time === 0) {
            return true;
        }
        const dist = move(v, a, time);
        if (dist === 0) {
            return false;
        }
        return onMove(dist);
    }, onEnd);
}

/**
 * 利用 requestAnimationFrame 执行动画循环
 * @param duration 动画时间间隔，使用 requestAnimationFrame 不需要设置
 * @param onMove 动画执行函数
 * @param onEnd 动画终止函数
 */
export const loopByFrame = (_duration = 16, onMove = () => true, onEnd = () => void 0): { destroy: () => void } => {

    let animateFrame;
    function step(func, end = () => void 0) {
        if (!func) {
            end();
            return;
        }

        if (!func()) {
            destroy();
            end();
            return;
        }

        animateFrame = window.requestAnimationFrame(() => {
            step(func, end);
        });
    }
    function destroy() {
        if (animateFrame) {
            window.cancelAnimationFrame(animateFrame);
        }
    }

    step(onMove, onEnd);

    return {
        destroy,
    }
}

/**
 * 利用 setInterval 执行函数循环
 * @param duration 时间间隔
 * @param cb 回调函数
 * @param onEnd 终止函数
 */
export const loopByInterval = (duration = 16, cb = () => true, onEnd = () => void 0): { destroy: () => void } => {
    const timer = setInterval(() => {
        if (!cb()) {
            clearInterval(timer);
            onEnd();
        }
    }, duration);
    return {
        destroy() {
            clearInterval(timer);
            onEnd();
        },
    }
}

/**
 * 计算以速度 v ，减速度 a，运动 time 时间的距离
 * @param v 速度
 * @param a 减速度
 * @param time 时间
 */
export const move = (v: number, a: number, time: number) => {
    // 获取下一时刻速度，如果速度为 0 终止
    const nextV = caclNextVelocity(v, a, time);
    if (nextV <= 0) {
        return 0;
    }
    // 计算下一刻的距离
    const dist = caclDist(v, time, a);
    return dist;
}

/**
 * 计算滚动方向，暂时只支持横向滚动
 * @param start 起始点
 * @param end 终点
 */
export const caclDirection = (start: TPoint, end: TPoint): TDirection => {
    const xLen = (end.x - start.x);
    const yLen = (end.y - start.y);
    if (Math.abs(xLen) > Math.abs(yLen)) {
        return xLen > 0 ? 'right' : 'left';
    } else {
        return yLen > 0 ? 'bottom' : 'top';
    }
}

/**
 * 减速直线运动公式，计算距离
 * @param v 速度
 * @param t 时间 单位秒
 * @param a 加速度
 */
export const caclDist = (v: number, t: number, a: number) => {
    return v * t - (a * t * t) / 2;
}

/**
 * 计算速度
 * @param v0 初始速度
 * @param a 加速度
 * @param t 时间
 */
export const caclNextVelocity = (v0: number, a: number, t: number) => {
    return v0 - a * t;
}

/**
 * 计算速度
 * @param dist 距离 单位像素
 * @param time 时间 单位秒
 */
export const caclVelocity = (dist: number, time: number) => {
    if (time <= 0) {
        return 0;
    }
    return dist / time;
}



export function debounce(fn, delay) {

    let timer = null;

    return function () {
        let args = arguments,
            context = this;
        if (timer) {
            clearTimeout(timer);

            timer = setTimeout(() => {
                fn.apply(context, args);
            }, delay);
        } else {
            timer = setTimeout(() => {
                fn.apply(context, args);
            }, delay);
        }
    };
}