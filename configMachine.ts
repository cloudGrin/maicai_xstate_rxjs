import { prompt } from 'inquirer'
import { createMachine } from 'xstate'

export interface IConfig {
  /**
   * 登录token
   */
  cookie: string
  /**
   * 叮咚要求入参的uid
   */
  uid: string
  /**
   * bark软件通知id
   */
  barkId: string
  /**
   * 支付方式
   * 2：支付宝 4：微信
   */
  payType: 2 | 4
  /**
   * 结算模式
   *  1：结算所有有效商品（不包括换购） 2：结算所有勾选商品（包括换购)
   */
  cartMode: 1 | 2
}

type FetchEvent = {
  type: 'RETRY'
}

const configMachine = createMachine<null, FetchEvent>({
  id: 'config',
  initial: 'init',
  states: {
    init: {
      invoke: {
        id: 'prompt',
        src: () =>
          prompt([
            {
              type: 'input',
              name: 'cookie',
              message: '请输入cookie',
              validate(input) {
                return !!input.trim()
              }
            },
            {
              type: 'input',
              name: 'uid',
              message: '请输入uid',
              validate(input) {
                return !!input.trim()
              }
            },
            {
              type: 'input',
              name: 'barkId',
              message: '请输入barkId',
              validate(input) {
                return !!input.trim()
              }
            },
            {
              type: 'list',
              name: 'payType',
              message: '请选择支付方式',
              choices: [
                { name: '支付宝', value: '2' },
                { name: '微信', value: '4' }
              ]
            },
            {
              type: 'list',
              name: 'cartMode',
              message: '请选择结算模式',
              choices: [
                { name: '结算所有有效商品（不包括换购）', value: '1' },
                { name: '结算所有勾选商品（包括换购)', value: '2' }
              ]
            }
          ]),
        onDone: {
          target: 'finished'
        },
        onError: [
          {
            target: 'failure'
          }
        ]
      }
    },
    finished: {
      type: 'final',
      data: {
        payload: (_, event) => event.data as IConfig
      }
    },
    failure: {
      on: {
        RETRY: { target: 'init' }
      }
    }
  }
})

export default configMachine
