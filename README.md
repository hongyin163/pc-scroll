
滚动条组件可以直接替换系统自带的滚动条，兼容 DOM API ,可以无缝切换到新的滚动条。

关于滚动条的实现可以参考：[基于 React 的滚动条方案](#/技术文章?id=section-基于-react-的滚动条方案)

滚动条示例：

```js static
<Scroll
    className="container"
    style={{
        height:300,
        width:500
    }}
>
    <div classNme="content">
        内容
    </div>
</Scroll>
```

Scroll 可以作为受控组件，也可以作为非受控组件，使用示例如下：
```js
import React,{Component} from 'react';

class Demo extends Component{
    constructor(props,context){
        super(props,context);
        const me=this;
    }
    onScroll(e){
        console.log(e.target)
    }
    render(){
        const me=this;
        return (            
            <Scroll
                className="container"
                style={{
                    width: 400,
                    height: 200,
                }}
                onScroll={me.onScroll}
            >
                <div className="content" ref="content" style={{
                    width: 400,
                    height: 800,

                }}>
                    测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试
                </div>
            </Scroll>            
        )
    }
}

<Demo/>
```

受控组件示例，可以实现多个滚动条联动：
```js
import React,{Component} from 'react';

class Demo extends Component{
    constructor(props,context){
        super(props,context);
        const me=this;
        me.state={
            scrollLeft:0,
            scrollTop:0,
        }
        me.onScroll=me.onScroll.bind(me);
    }
    onScroll(e){
        const me=this;
        me.setState({
            scrollLeft:e.target.scrollLeft,
            scrollTop:e.target.scrollTop
        });        
    }
    render(){
        const me=this;
        const {
            scrollLeft,
            scrollTop
        }=me.state;
        return (     
            <>       
                <Scroll
                    scrollLeft={scrollLeft} 
                    scrollTop={scrollTop}
                    className="container"
                    style={{ width: 400, height: 200,}}
                    onScroll={me.onScroll}
                >
                    <div className="content" ref="content" 
                        style={{width: 800,height: 400}}>
                        测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试
                    </div>
                </Scroll>      
                <Scroll
                    scrollLeft={scrollLeft}
                    scrollTop={scrollTop}
                    className="container"
                    style={{width: 400,height: 200,}}
                    onScroll={me.onScroll}
                >
                    <div className="content" ref="content" 
                        style={{width: 800,height: 400,}}>
                        测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试
                    </div>
                </Scroll>    
            </>        
        )
    }
}

<Demo/>
```
