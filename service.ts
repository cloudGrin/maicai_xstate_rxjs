import { commonHeader } from './const'
import { prompt } from 'inquirer'
import fetch from 'node-fetch'

export interface IConfig {
  /**
   * 登录token
   */
  cookie: string
  /**
   * 支付方式
   * 2：支付宝 4：微信
   */
  payType: 2 | 4
}

/**
 * 获取用户配置
 */
export function getConfig(): Promise<IConfig> {
  return Promise.resolve({
    cookie: '6f891cf2b71ff7f0730ac6c83d52dd92',
    payType: 2
  })
  // return prompt([
  //   {
  //     type: 'input',
  //     name: 'cookie',
  //     message: '请输入cookie',
  //     validate(input) {
  //       return !!input.trim()
  //     }
  //   },
  //   {
  //     type: 'list',
  //     name: 'payType',
  //     message: '请选择支付方式',
  //     choices: [
  //       { name: '支付宝', value: '2' },
  //       { name: '微信', value: '4' }
  //     ]
  //   }
  // ])
}

/**
 * 获取地址
 */
export function getAddress({ cookie }: { cookie: string }): Promise<any> {
  function api(): Promise<{
    data?: {
      valid_address: {
        station_id: string
        city_number: string
        addr_detail: string
        location: {
          location: [number, number]
          address: string
          name: string
        }
        id: string
      }[]
    }
    code: number
    message: string
  }> {
    function generateAddress() {
      return {
        station_id: '1',
        city_number: '1111',
        addr_detail: '1栋204',
        location: {
          address: '测试地址',
          name: '测试街道',
          location: [111.33, 32.11] as [number, number]
        },
        id: 'sadas23123'
      }
    }
    return new Promise((resolve, reject) => {
      const randomNum = Math.random()
      if (randomNum > 0.99) {
        resolve({ code: -1, message: 'token 失效' })
      } else if (randomNum > 0.5) {
        resolve({ code: -2, message: '接口正忙，请稍后重试' })
      } else {
        // success
        resolve({ code: 0, data: randomNum > 0.1 ? { valid_address: [generateAddress()] } : { valid_address: [] }, message: 'success' })
      }
    })
  }
  return api().then((res) => {
    const { data, code, message } = res
    const addressLength = data?.valid_address?.length ?? 0
    if (code === 0 && addressLength > 0) {
      if (addressLength === 1) {
        // 一个地址时不需要选择
        return data!.valid_address[0]
      }
      return prompt({
        type: 'list',
        name: 'address',
        message: '请选择地址',
        choices: data!.valid_address.map((info) => ({ value: info, name: `${info.location.address} ${info.location.name} ${info.addr_detail}` }))
      })
    } else {
      return Promise.reject({
        code: code === 0 ? -3 : code,
        message: code === 0 ? (data?.valid_address?.length ?? 0) === 0 && '无可用地址' : message
      })
    }
  })
}

/**
 * 获取购物车
 */
export function getCart({ cookie }: { cookie: string }): Promise<any> {
  function api(): Promise<{
    data?: {
      prodList: {}[]
    }
    code: number
    message: string
  }> {
    function generateProd() {
      return {
        name: '香蕉',
        id: '1',
        price: '10.00'
      }
    }
    return new Promise((resolve, reject) => {
      const randomNum = Math.random()
      if (randomNum > 0.99) {
        resolve({ code: -1, message: 'token 失效' })
      } else if (randomNum > 0.5) {
        resolve({ code: -2, message: '接口正忙，请稍后重试' })
      } else {
        // success
        resolve({ code: 0, data: randomNum > 0.05 ? { prodList: [generateProd()] } : { prodList: [] }, message: 'success' })
      }
    })
  }
  return api().then((res) => {
    const { data, code, message } = res
    const prodListLength = data?.prodList?.length ?? 0
    if (code === 0 && prodListLength > 0) {
      return data
    } else {
      return Promise.reject({
        code: code === 0 ? -3 : code,
        message: code === 0 ? (data?.prodList?.length ?? 0) === 0 && '购物车无商品' : message
      })
    }
  })
}

/**
 * 获取可配送时间
 */
export function getDeliveryTime({ cookie }: { cookie: string }): Promise<any> {
  function api(): Promise<{
    data?: {
      timeList: {}[]
    }
    code: number
    message: string
  }> {
    return new Promise((resolve, reject) => {
      const randomNum = Math.random()
      if (randomNum > 0.99) {
        resolve({ code: -1, message: 'token 失效' })
      } else if (randomNum > 0.5) {
        resolve({ code: -2, message: '接口正忙，请稍后重试' })
      } else {
        // success
        resolve({
          code: 0,
          data:
            randomNum > 0.1
              ? {
                  timeList:
                    randomNum > 0.2
                      ? [
                          {
                            startTime: '09:00',
                            endTime: '09:30'
                          },
                          {
                            startTime: '10:00',
                            endTime: '10:30'
                          }
                        ]
                      : [
                          {
                            startTime: '09:00',
                            endTime: '09:30'
                          }
                        ]
                }
              : { timeList: [] },
          message: 'success'
        })
      }
    })
  }
  return api().then((res) => {
    const { data, code, message } = res
    const prodListLength = data?.timeList?.length ?? 0
    if (code === 0 && prodListLength > 0) {
      return data
    } else {
      return Promise.reject({
        code: code === 0 ? -3 : code,
        message: code === 0 ? (data?.timeList?.length ?? 0) === 0 && '无可配送时间' : message
      })
    }
  })
}

/**
 * 下单
 */
export function postOrder({
  cookie,
  prodList,
  time
}: {
  cookie: string
  prodList: any[]
  time: {
    startTime: string
    endTime: string
  }
}): Promise<any> {
  console.log('提交订单', prodList, time)
  function api(): Promise<{
    code: number
    message: string
  }> {
    return new Promise((resolve, reject) => {
      const randomNum = Math.random()
      if (randomNum > 0.99) {
        resolve({ code: -1, message: 'token 失效' })
      } else if (randomNum > 0.6) {
        resolve({ code: -2, message: '接口正忙，请稍后重试' })
      } else if (randomNum > 0.4) {
        resolve({ code: -4, message: '商品已售罄' })
      } else if (randomNum > 0.2) {
        resolve({ code: -5, message: '配送时间已约满' })
      } else {
        // success
        resolve({
          code: 0,
          message: 'success'
        })
      }
    })
  }
  return api().then((res) => {
    const { code, message } = res
    if (code === 0) {
      return true
    } else {
      return Promise.reject({
        code,
        message
      })
    }
  })
}
