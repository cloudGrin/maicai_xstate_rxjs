import { assign, createMachine, interpret, send } from 'xstate'
import type { IConfig } from './service'
import { getAddress, getCart, getConfig, getDeliveryTime, postOrder } from './service'
interface Context {
  config: IConfig
  /**
   * 地址对象
   */
  address?: {
    station_id: string
    city_number: string
    location: {
      location: [number, number]
    }
    id: string
  }
  /**
   * 购物车数据
   */
  cartData?: {
    prodList: any[]
  }
  /**
   * 配送时间
   */
  deliveryTime?: {
    timeList: { startTime: string; endTime: string }[]
  }
}

type FetchEvent =
  | {
      /**
       * 重试
       */
      type: 'RETRY'
    }
  | {
      /**
       * 成功
       */
      type: 'SUCCESS'
    }
  | {
      /**
       * 失败，终止顶级状态机
       */
      type: 'FAILED'
    }
  | {
      /**
       * 订单内无有效商品
       */
      type: 'PROD_LIST_EMPTY'
    }

/** @xstate-layout N4IgpgJg5mDOIC5QQJYDsoBED2GB06KALgMQS5gFoBu2A1pahjvoUQurQMYCGRKuANoAGALqJQAB2yxiAtBJAAPRAEYAbAE48ADmGqA7ACZjmgCyajqnToA0IAJ5qj6vKtWbPAVncHrBrwBfYPs0bAg4RSYsXCgqYkVpWX5cRRUEMyN7JwRVI211D29ffyDA+2iWOK5cADMUGLQwRJk5VKRlRABmYW0PIy6vA3VhAZcA7OcCos0fQ1KQkErYvFqeFAAbAFcAJ2aOpLaFDvShvC6dAMzjMxHNLonHRADdXs8Arx0ve4DF5YwWsl5Gk1HYnggjLpVMIYdDNOodOouuobsFgkA */
const mainMachine = createMachine<Context, FetchEvent>(
  {
    id: 'dingDong',
    // 初始状态
    initial: 'config',
    strict: true,
    context: {
      config: { cookie: '', payType: 2 },
      address: undefined,
      cartData: undefined,
      deliveryTime: undefined
    },
    states: {
      config: {
        invoke: {
          id: 'getConfig',
          src: () =>
            getConfig().catch((err) => {
              console.log(err)
              return Promise.reject(err)
            }),
          onDone: {
            // 回传基础配置数据
            actions: 'setConfig',
            target: 'address'
          },
          onError: [
            {
              target: 'failure'
            }
          ]
        }
      },
      address: {
        initial: 'idle',
        states: {
          idle: {
            invoke: {
              id: 'getAddress',
              src: (context) =>
                getAddress({ cookie: context.config.cookie }).catch((err) => {
                  console.log(err)
                  return Promise.reject(err)
                }),
              onDone: {
                actions: [send('SUCCESS'), 'setAddress']
              },
              onError: [
                {
                  actions: [send('FAILED')],
                  // 无可用地址或者token 失效，需要停止
                  cond: 'isCodeOrNoValidData'
                },
                {
                  target: 'retry',
                  // 接口正忙，需要重试
                  cond: 'isNeedRetry'
                }
              ]
            }
          },
          retry: {
            after: {
              1000: {
                target: 'idle'
              }
            }
          }
        },
        on: {
          SUCCESS: {
            target: 'pendingOrder'
          }
        }
      },
      pendingOrder: {
        type: 'parallel',
        states: {
          cart: {
            initial: 'idle',
            states: {
              idle: {
                invoke: {
                  id: 'getCart',
                  src: (context) =>
                    getCart({ cookie: context.config.cookie }).catch((err) => {
                      console.log(err)
                      return Promise.reject(err)
                    }),
                  onDone: {
                    target: 'success',
                    actions: 'setCartData'
                  },
                  onError: [
                    {
                      actions: [send('FAILED')],
                      // 无商品或者token 失效，需要停止
                      cond: 'isCodeOrNoValidData'
                    },
                    {
                      target: 'retry',
                      // 接口正忙，需要重试
                      cond: 'isNeedRetry'
                    }
                  ]
                }
              },
              retry: {
                after: {
                  1000: {
                    target: 'idle'
                  }
                }
              },
              success: {
                type: 'final'
              }
            }
          },
          deliveryTime: {
            initial: 'idle',
            states: {
              idle: {
                invoke: {
                  id: 'getDeliveryTime',
                  src: (context) =>
                    getDeliveryTime({ cookie: context.config.cookie }).catch((err) => {
                      console.log(err)
                      return Promise.reject(err)
                    }),
                  onDone: {
                    target: 'success',
                    actions: 'setDeliveryTime'
                  },
                  onError: [
                    {
                      actions: [send('FAILED')],
                      // 无配送时间或者token 失效，需要停止
                      cond: 'isCodeOrNoValidData'
                    },
                    {
                      target: 'retry',
                      // 接口正忙，需要重试
                      cond: 'isNeedRetry'
                    }
                  ]
                }
              },
              retry: {
                after: {
                  1000: {
                    target: 'idle'
                  }
                }
              },
              success: {
                type: 'final'
              }
            }
          }
        },

        onDone: {
          target: 'order'
        }
      },
      order: {
        initial: 'idle',
        states: {
          idle: {
            invoke: {
              id: 'postOrder',
              src: (context) => {
                return postOrder({ cookie: context.config.cookie, prodList: context.cartData?.prodList!, time: context.deliveryTime?.timeList[0]! }).catch((err) => {
                  console.log(err)
                  return Promise.reject(err)
                })
              },
              onDone: {
                actions: send('SUCCESS')
              },
              onError: [
                {
                  target: 'retry',
                  // 接口正忙，需要重试
                  cond: 'isNeedRetry'
                },
                {
                  actions: send('FAILED'),
                  // token 失效，需要停止
                  cond: 'isTokenExpired'
                },
                {
                  actions: send('PROD_LIST_EMPTY'),
                  // 商品已售罄
                  cond: 'isProdListEmpty'
                },
                {
                  target: 'retryAnotherTime',
                  // 配送时间已约满
                  cond: 'isTimeFull',
                  actions: 'filterTimeList'
                }
              ]
            }
          },
          retryAnotherTime: {
            always: [
              {
                target: 'failure',
                cond: 'isTimeListEmpty'
              },
              {
                target: 'idle',
                cond: 'isTimeListExist'
              }
            ]
          },
          retry: {
            after: {
              1000: {
                target: 'idle'
              }
            }
          },
          failure: {
            entry: [send('FAILED')],
            type: 'final'
          }
        },
        on: {
          SUCCESS: {
            target: 'success'
          },
          PROD_LIST_EMPTY: {
            target: ['pendingOrder.cart.idle', 'pendingOrder.deliveryTime.success']
          }
        }
      },
      failure: {
        on: {
          // 重试
          RETRY: { target: 'config' }
        }
      },
      success: {
        type: 'final'
      }
    },
    on: {
      FAILED: {
        target: 'failure'
      }
    }
  },
  {
    guards: {
      isCodeOrNoValidData: (_, event: any) => [-1, -3].includes(event.data.code),
      isNeedRetry: (_, event: any) => event.data.code === -2,
      isTokenExpired: (_, event: any) => event.data.code === -1,
      isProdListEmpty: (_, event: any) => event.data.code === -4,
      isTimeFull: (_, event: any) => event.data.code === -5,
      isTimeListEmpty: (context) => {
        return context.deliveryTime!.timeList?.length === 0
      },
      // 存在时间段可用
      isTimeListExist: (context) => {
        return context.deliveryTime!.timeList?.length > 0
      }
    },
    actions: {
      setConfig: assign((_, event: any) => {
        console.log(`拿到配置数据: ${JSON.stringify(event.data)}`)
        return { config: event.data }
      }),
      setAddress: assign((_, event: any) => {
        console.log(`拿到地址数据: ${JSON.stringify(event.data)}`)
        return { address: event.data }
      }),
      setCartData: assign((_, event: any) => {
        console.log(`拿到购物车数据: ${JSON.stringify(event.data)}`)
        return { cartData: event.data }
      }),
      setDeliveryTime: assign((_, event: any) => {
        console.log(`拿到配送时间数据: ${JSON.stringify(event.data)}`)
        return { deliveryTime: event.data }
      }),
      filterTimeList: assign((context) => {
        return {
          deliveryTime: {
            timeList: context.deliveryTime!.timeList.filter((time) => time !== context.deliveryTime!.timeList[0])
          }
        }
      })
    }
  }
)

interpret(mainMachine)
  .onTransition((state) => console.log(JSON.stringify(state.value)))
  .start()
