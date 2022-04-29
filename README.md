# 实现买菜自动化全流程

> 由于自动化过程涉及到复杂的状态流转，而且大多涉及到异步流程，并根据异步结果进行不同的操作，在以往编码中，往往通过命令式的代码进行逻辑处理，往往必须设置一些描述流程中间状态的变量，或者函数到处调用的情况，描述的流程往往会显得繁琐，所以考虑通过近期所学的 XState 和 RxJs 对这个过程加以描述。这个代码稍微修改也可以描述类似的流程，比如自动化脚本的执行等等。

## 使用 xstate 构建流程

### 流程图

![image](https://github.com/cloudGrin/maicai_xstate_rxjs/blob/main/IMG/maicai_xstate.png)

### 运行测试代码

```bash
$ npm run dev
```

### 遇到的问题

- 使用无事件（Always）时，未直接指定 target（目标状态），而是使用 send 发送事件，在事件中进行了状态跳转，导致循环调用，堆栈溢出；解决方式：办法也很简单，指定 target，并在 target 状态的 entry 里进行事件 send；

- 当依赖 send 进行 context 数据赋值时，如果此时与 send 同时触发的状态转换的目标状态需要读取 context 时，就会出现访问到旧数据的问题，解决方式：要么把状态流转放到 send 触发的事件里做，要么不使用 send，直接进行 assign 对 context 赋值即可
