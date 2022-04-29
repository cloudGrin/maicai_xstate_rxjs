import { assign, createMachine, actions } from 'xstate'
import { prompt } from 'inquirer'
import type { IConfig } from './configMachine'
import fetch from 'node-fetch'
import { commonHeader } from './const'

const { escalate } = actions


export interface Context {
  config: IConfig
  /**
   * 重试次数
   */
  retryCount: number
}

type FetchEvent =
  | {
      type: 'RETRY'
    }
  | {
      type: 'GET_ADDRESS.FAILURE'
    }

const addressMachine = createMachine<Context, FetchEvent>({
  id: 'address',
  initial: 'init',
  context: {
    config: { cookie: '', uid: '', barkId: '', payType: 2, cartMode: 2 },
    retryCount: 0
  },
  states: {
    init: {
      invoke: {
        id: 'getAddress',
        src: (context) =>
          fetch(
            `https://sunquan.api.ddxq.mobi/api/v1/user/address/?${new URLSearchParams({
              api_version: '9.49.1',
              app_version: '2.81.4'
            }).toString()}`,
            {
              method: 'GET',
              headers: {
                ...commonHeader,
                'ddmc-uid': context.config.uid,
                cookie: `DDXQSESSID=${context.config.cookie}`
              }
            }
          )
            .then((res) => res.json())
            .then((res) => {
              const { data, success, message } = res
              const addressLength = data?.valid_address?.length ?? 0
              if (success && addressLength > 0) {
                if(addressLength === 1) {
                  // 一个地址时不需要选择
                  return data.valid_address[0]
                }
                return prompt({
                  type: 'list',
                  name: 'address',
                  message: '请选择地址',
                  choices: data.valid_address.map((info) => ({ value: info, name: `${info.location.address} ${info.location.name} ${info.addr_detail}` }))
                })
              } else {
                return Promise.reject(new Error(success ? ((data?.valid_address?.length ?? 0) === 0 ? '无可用地址' : '') : message || '获取地址失败'))
              }
            }),
        onDone: {
          target: 'finished'
        },
        onError: [
          {
            target: 'failure'
          }
        ]
      },
      on: {
        'GET_ADDRESS.FAILURE': {
          target: 'failure'
        }
      }
    },
    retry: {
      // TODO 接口正忙时重试逻辑
      after: {
        // 延迟后，过渡到 init状态进行重试
        1000: { target: 'init' }
      }
    },
    failure: {
      // 判定为需要终止的错误
      entry: escalate((_, event: any) => ({ message: event.data.message }))
    },
    finished: {
      // 获取地址成功，把选择的地址返回给父
      type: 'final',
      data: {
        payload: (_, event) => event.data
      }
    }
  }
})

export default addressMachine
