import { assign, createMachine, raise, fromPromise, createActor } from 'xstate'
import type { IConfig, IAddress, ITime, ProdList } from './service'
import { getAddress, getCart, getConfig, getDeliveryTime, postOrder } from './service'

interface Context {
  config: IConfig
  /**
   * 地址对象
   */
  address?: IAddress
  /**
   * 购物车数据
   */
  cartData?: ProdList
  /**
   * 配送时间
   */
  deliveryTime?: ITime[]
}

// type FetchEvent =
//   | {
//       /**
//        * 重试
//        */
//       type: 'RETRY'
//     }
//   | {
//       /**
//        * 成功
//        */
//       type: 'SUCCESS'
//     }
//   | {
//       /**
//        * 失败，终止顶级状态机
//        */
//       type: 'FAILED'
//     }
//   | {
//       /**
//        * 订单内无有效商品
//        */
//       type: 'PROD_LIST_EMPTY'
//     }

const mainMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QQJYDsoBED2GDEAYgIICSAMgKKYDaADALqKgAO2sKALirkyAB6IAnAEYArADphAJgAsgmTOG1RAdloA2dQBoQAT0SjagydJUAOGQGYZZ9WbNTRAXyc7UGHPgBUdRkhCs7Fw8-gIIwnJm4iIqUpaiUlIqEeqCOvrh6qri9vKWUoIJUma0Ki5u6Fi4UOIAxrgAZihQeBC4YOLoAG7YANYdMBwAwo3NvryBnNxovGHC8+riViqCtJarlvHC6YiytJIyhkbqKubCguoy5SDuVRh1oy1gAE7P2M-izAA2AIYcDe8ALbiQYjNBNKDjfyTYIzUKIebCRbLDYbLY7BDrYTRBzWeJY6Tqa63Tw1H4QCDPOCwPAAZQAqkMhhRabSoSw2FMQqAwsVNJJ5MllFJaDZRBipOpsWJzuoNGIjBYia4bpVSeJyZTqZ0IF8wK12p00D1+iCwBwiBSqbBYOyApzYbNdpLFmZrGZBJ6TusVBLFOJ1MV5olSjJEhdiWrqhqrdqULr9S83h9vn8Ac9gYNLVqbXaYdMnQhEtlRBExPIKypROK9AjDOJLOpLOZEsJrCpG5GPNHNdbYDq9Xgk+9Pr9-kCzRbY7nhH4OUEC-Ci4d9odHCKq6tqzWMjJlOJaI4RJs2yopV27mTp-2qRxnro8HxYBw-h0fg0OC8ABRKWi0ACUrRRvcvbare955g6i48rsgbYoIJSWNIlhmPM6wyBi8RRKch6iBYCg2PIyoVN29zMGAaC3AA8s8EAvAaaAdM+r7iCS0bkZRlQ0XRzyQQu3L8EIYiSLI8iKMoaiaBiCEqAeoiaB6ZbCG6wgXuqHHUbRLx1D8zwcAO+ptIxRomgM5pDLpHB8VycIwZi-prFI8yoTIpxSs2GJtiU4hqI4liHmG5hrGp7EUZpPE6XpBlDq8I6puOGaThZenWY6S7luIhhWNWgaEYIKgYbW4TNjISx2AVbbzFW8khWRYVcVpHy1JZ0XDimY7ppm5mWdQs4TFBAlhNY2KOc5ERuaenmllEiSODKGh-qpKpsXVnEYNx2nNVF4EPk+L6fhqH7fr+AFAaRNQaQ1EVbfpO2pdBgkIDYUSXHI1Z7s2SQ7girnwQpcpxCcBTEaq52fPV62NaxYBfCgXQvLoAAqKCAh08aDkZaPGn0ZkcJgMNwwjyOo-dg2IChpXCGo8xHAhbpup5tDeb+YiqG2IMrRdENQBtHx0bD8P3sTaMJjFyajmmE6DPjAtEyjYCk7Zj1iFIjMdjkmiNicDiqKIVzLcBXNrTzUP84TQvy61sXtZLiXSwTgtI-LvVzva-FK0NFiSNTCqKvTlieU5smBrQEQSXYIqCLVRvhdpZuO8L4g7Y+zEHe+n7PD+f6nZz4PG7z0OyxbqNJ+aEEMP17uFnhpWCMDcrNqcyRpEVVXYo2ChmKopR6-I0fiO8PF0oyzKsorhazbJpaKKIFZyNV0mijkog+pcin2JY-eD-RAAKABKVGYAA+mQJC0ojR8UAAsjviMAJrj0uIgSNIcgKEo3dSUVqGLI3a7+YILWzgDZg23h8dGhlDTdBxp8NgHBeaPzstIQ8AZqxIVUI2U4ChpJIQPB2WILokjxCkFvKGECxZxQ6hOQI8DGqIOVgRJY7onJthXvIb6CALi-yRM-IojhAykIiuQtqEsErAhoQgvq0IBoewRCkJhKw1holLBiN0xgSiALrgpcws9BHaWEdbURnVYHPgQVIV2+YybhHkSiJRax0RFQKlEPWhhAwnBsFrPR4DRYiPisYiRdDLAWJkYWCICgmE2BYfidhjNsibCZihJsGCo4gMvAPKGO0iBoGwBwAAFi8YWeB6FzFWMYKsJQu6yDdOYMwatSp+U0bESpbYvGlzvLoLJOT8nPEKS7SuNlQnyQkPYTW5xXIVlqa3UOUhMqxG7liBIpxWnJz2ixdOx1s6AVzmAtp5dglV3SnKWSiRThIRODJVWRU677HlJKDQCQEIyA5obcQDQfgoC+AAVypHgPeFBEZ7wfhXaRBy7JOVKAefKz0KY5Q4dYGZHZzhiEUPlEUZgXAqmyXReA-hOb9LSnZSZGQAC0cRoiegpZSilth+71HBM0fFD0wjyBmXuVQXdqp4Xyphc44gkgbFLOcdYXd+6gRtIyqxIZjDT3LG-fK1YMRNkkKhLuh4NBViyEtEiaSxX9ggRK2RRYkh-SaR-JC7ZMKXD5UiRI6xZ4JGeWDXVuyMjzgGUuJIYZlVWHOBoMwagFVFR9DkYolTSxxEMMA7V6lua8wNdXbQ39PSZUPJoJsqQNCyH7pdSG11LLxvSvMFN2V5JVM9AVQO-q+X+uUBYOIv4o2gzSTmk2eaor6pBe6pBgZPKuX2B2fyyR-Ld0bbnFtBcbouoLXZOUUQLAehDiIAo8QppFtwocKwopZ7KGzbGqGk7YCfNqLUak07HqzpyIRRd0hAEcLDvsPEPcnKliXbu-OpsHZy1RmeuYoppK2ADBYUsWRynKRSdG0K76Irxy-SLPUP6ESoQPHYT0FgkK3IDq3Km+w2waAuG5BIrk32xz5p+4uHQdoIYQAGyQmxNCSRXs2FuGRpBKCWHEUo+UqziU3qkmNUG45kadiXQ9x7T2doJY9GjbYtYMc2CsRmyaCqlD-HYOU8wvFUaUAhBRqJ7EqKKpoduTYnKyDsEzUOrSO1usk3MEUlh2NrDWAoXuiRGZJAbChYUWQFJPOWWXDp2S8kFPllp2IskfUdjdO4lCasZlNhKKobjNgzz+faWFjzkWUKYKsESoQs8TD5UbD-FCyRWlvI+d8sAVGRRktnsa8MsokiMxsHJPCpRsuFBQv3CrXyqQ1ZOZlMss85ULyKnIYwn0JsRGKPkLVTb1SiZPeKiTTLdi2EWGMoUCRRRd0Xg5lLWQPQOsuMqFwQA */
    id: 'dingDong',
    // 初始状态
    initial: 'config',
    context: {
      config: { cookie: '', payType: 2 },
      address: undefined,
      cartData: undefined,
      deliveryTime: undefined
    } as Context,
    states: {
      config: {
        invoke: {
          id: 'getConfig',
          src: fromPromise(async () => {
            const data = await getConfig()
            return data
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
              src: fromPromise(async ({ input }) => {
                const data = await getAddress({ cookie: input.config.cookie })
                return data
              }),
              input: ({ context }) => {
                return {
                  config: context.config
                }
              },
              onDone: {
                actions: [raise({ type: 'SUCCESS' }), 'setAddress']
              },
              onError: [
                {
                  actions: [
                    raise({ type: 'FAILED' }),
                    () => {
                      console.log('getAddress 无可用地址或者token 失效')
                    }
                  ],
                  // 无可用地址或者token 失效，需要停止
                  guard: 'isCodeOrNoValidData'
                },
                {
                  target: 'retry',
                  actions: [
                    () => {
                      console.log('重新获取地址')
                    }
                  ],
                  // 接口正忙，需要重试
                  guard: 'isNeedRetry'
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
                  src: fromPromise(async ({ input }) => {
                    const data = await getCart({ cookie: input.config.cookie })
                    return data
                  }),
                  input: ({ context }) => ({
                    config: context.config
                  }),
                  onDone: {
                    target: 'success',
                    actions: 'setCartData'
                  },
                  onError: [
                    {
                      actions: [
                        raise({ type: 'FAILED' }),
                        () => {
                          console.log('getCart 无商品或者token 失效')
                        }
                      ],
                      // 无商品或者token 失效，需要停止
                      guard: 'isCodeOrNoValidData'
                    },
                    {
                      target: 'retry',
                      actions: [
                        () => {
                          console.log('重新获取购物车')
                        }
                      ],
                      // 接口正忙，需要重试
                      guard: 'isNeedRetry'
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
                  src: fromPromise(async ({ input }) => {
                    const data = await getDeliveryTime({ cookie: input.config.cookie })
                    return data
                  }),
                  input: ({ context }) => ({
                    config: context.config
                  }),
                  onDone: {
                    target: 'success',
                    actions: 'setDeliveryTime'
                  },
                  onError: [
                    {
                      actions: [
                        raise({ type: 'FAILED' }),
                        () => {
                          console.log('getDeliveryTime 无配送时间或者token 失效')
                        }
                      ],
                      // 无配送时间或者token 失效，需要停止
                      guard: 'isCodeOrNoValidData'
                    },
                    {
                      target: 'retry',
                      actions: [
                        () => {
                          console.log('重新获取配送时间')
                        }
                      ],
                      // 接口正忙，需要重试
                      guard: 'isNeedRetry'
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
              src: fromPromise(async ({ input }) => {
                const data = await postOrder({
                  cookie: input.config.cookie,
                  prodList: input.cartData!,
                  time: input.deliveryTime![0],
                  address: input.address!
                })
                return data
              }),
              input: ({ context }) => ({
                config: context.config,
                cartData: context.cartData,
                deliveryTime: context.deliveryTime,
                address: context.address
              }),
              onDone: {
                actions: raise({ type: 'SUCCESS' })
              },
              onError: [
                {
                  target: 'retry',
                  actions: [
                    () => {
                      console.log('重新提交订单')
                    }
                  ],
                  // 接口正忙，需要重试
                  guard: 'isNeedRetry'
                },
                {
                  actions: [
                    raise({ type: 'FAILED' }),
                    () => {
                      console.log('token 失效')
                    }
                  ],
                  // token 失效，需要停止
                  guard: 'isTokenExpired'
                },
                {
                  actions: [
                    raise({ type: 'PROD_LIST_EMPTY' }),
                    () => {
                      console.log('订单内无有效商品,由于可能会更新库存，所以重新获取购物车数据')
                    }
                  ],
                  // 商品已售罄
                  guard: 'isProdListEmpty'
                },
                {
                  target: 'retryAnotherTime',
                  // 选择的时间配送已约满，请重新选择
                  guard: 'isTimeFull',
                  actions: [
                    'filterTimeList',
                    () => {
                      console.log('当前配送时间已约满，选择下一个时间段')
                    }
                  ]
                }
              ]
            }
          },
          retryAnotherTime: {
            always: [
              {
                target: 'orderFailure',
                actions: [
                  () => {
                    console.log('无可用时间段')
                  }
                ],
                guard: 'isTimeListEmpty'
              },
              {
                target: 'idle',
                actions: [
                  () => {
                    console.log('无配送时间段,重新获取配送时间数据')
                  }
                ],
                guard: 'isTimeListExist'
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
          orderFailure: {
            entry: [raise({ type: 'FAILED' })],
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
        type: 'final',
        entry: [
          () => {
            console.log('下单成功')
          }
        ]
      }
    },
    on: {
      FAILED: {
        target: '.failure'
      }
      // '*': {
      //   // unknown event
      //   actions: ({ event }) => {
      //     console.error(`Unknown event: ${event.type}`)
      //   }
      // }
    }
  },
  {
    guards: {
      isCodeOrNoValidData: ({ event }) => {
        return [-1, -3].includes(event.error.code)
      },
      isNeedRetry: ({ event }) => event.error.code === -2,
      isTokenExpired: ({ event }) => event.error.code === -1,
      isProdListEmpty: ({ event }) => event.error.code === -4,
      isTimeFull: ({ event }) => event.error.code === -5,
      isTimeListEmpty: ({ context }) => {
        return context.deliveryTime?.length === 0
      },
      // 存在时间段可用
      isTimeListExist: ({ context }) => {
        return context.deliveryTime!?.length > 0
      }
    },
    actions: {
      setConfig: assign(({ event }) => {
        console.log(`拿到配置数据: ${JSON.stringify(event.output)}`)
        return { config: event.output }
      }),
      setAddress: assign(({ event }) => {
        console.log(`拿到地址数据: ${JSON.stringify(event.output.data)}`)
        return { address: event.output.data }
      }),
      setCartData: assign(({ event }) => {
        console.log(`拿到购物车数据: ${JSON.stringify(event.output.data)}`)
        return { cartData: event.output.data }
      }),
      setDeliveryTime: assign(({ event }) => {
        console.log(`拿到配送时间数据: ${JSON.stringify(event.output.data)}`)
        return { deliveryTime: event.output.data }
      }),
      filterTimeList: assign(({ context }) => {
        return {
          deliveryTime: context.deliveryTime!.slice(1)
        }
      })
    }
  }
)

const mainActor = createActor(mainMachine)

// interpret(mainMachine)
//   .onTransition((state) => console.log('当前状态机状态', JSON.stringify(state.value)))
//   .start()

mainActor.subscribe((state) => {
  if (state.value !== 'config') {
    console.log(JSON.stringify(state.value))
  }
})

// Actors must be started by calling `actor.start()`, which will also start the actor system.
mainActor.start()
