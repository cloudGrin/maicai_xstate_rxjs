/* eslint-disable @typescript-eslint/no-unused-vars */
import inquirer from 'inquirer'
import { nanoid } from 'nanoid'

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

interface IRes<T = never> {
  code: number
  message: string
  data?: T
}

/**
 * 获取用户配置
 */
export function getConfig(): Promise<IConfig> {
  console.log('🚀 ~ file: service.ts ~ line 20 ~ getConfig ~ getConfig')
  // return Promise.resolve({
  //   cookie: nanoid(),
  //   payType: 2
  // })

  // return Promise.reject({
  //   code: -1,
  //   message: '获取config失败'
  // })

  return inquirer.prompt([
    {
      type: 'input',
      name: 'cookie',
      message: '请输入cookie',
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
    }
  ])
}

export interface IAddress {
  station_id: string
  city_number: string
  addr_detail: string
  location: {
    location: [number, number]
    address: string
    name: string
  }
  id: string
}
/**
 * 获取地址
 */
export function getAddress({ cookie }: { cookie: string }): Promise<IRes<IAddress>> {
  console.log('🚀 ~ file: service.ts ~ line 50 ~ getAddress ~ getAddress')
  function api(): Promise<{
    data?: {
      valid_address: IAddress[]
    }
    code: number
    message: string
  }> {
    function generateAddress() {
      return {
        station_id: nanoid(),
        city_number: '1111',
        addr_detail: '1栋204',
        location: {
          address: '测试地址',
          name: '测试街道',
          location: [111.33, 32.11] as [number, number]
        },
        id: nanoid()
      }
    }
    return new Promise((resolve, reject) => {
      // resolve({
      //   code: 0,
      //   data: { valid_address: [generateAddress()] },
      //   message: 'success'
      // })

      const randomNum = Math.random()
      if (randomNum > 0.99) {
        resolve({ code: -1, message: 'token 失效' })
      } else if (randomNum > 0.5) {
        resolve({ code: -2, message: '接口正忙，请稍后重试' })
      } else {
        // success
        resolve({
          code: 0,
          data: randomNum > 0.1 ? { valid_address: [generateAddress()] } : { valid_address: [] },
          message: 'success'
        })
      }
    })
  }
  return api().then((res) => {
    const { data, code, message } = res
    const addressLength = data?.valid_address?.length ?? 0
    if (code === 0 && addressLength > 0) {
      if (addressLength === 1) {
        // 一个地址时不需要选择
        return { data: data?.valid_address[0], code, message }
      }
      return inquirer
        .prompt({
          type: 'list',
          name: 'address',
          message: '请选择地址',
          choices: data!.valid_address.map((info) => ({
            value: info,
            name: `${info.location.address} ${info.location.name} ${info.addr_detail}`
          }))
        })
        .then((res1) => {
          return { data: res1, code, message }
        })
    }
    return Promise.reject({
      code: code === 0 ? -3 : code,
      message: code === 0 ? (data?.valid_address?.length ?? 0) === 0 && '无可用地址' : message
    })
  })
}

export type ProdList = {}[]

/**
 * 获取购物车
 */
export function getCart({ cookie }: { cookie: string }): Promise<IRes<ProdList>> {
  console.log('🚀 ~ file: service.ts ~ line 126 ~ getCart ~ getCart')
  function api(): Promise<{
    data?: {
      prodList: ProdList
    }
    code: number
    message: string
  }> {
    function generateProd() {
      return {
        name: '香蕉',
        id: nanoid(),
        price: '10.00'
      }
    }
    return new Promise((resolve, reject) => {
      // resolve({
      //   code: 0,
      //   data: { prodList: [generateProd()] },
      //   message: 'success'
      // })

      const randomNum = Math.random()
      if (randomNum > 0.99) {
        resolve({ code: -1, message: 'token 失效' })
      } else if (randomNum > 0.5) {
        resolve({ code: -2, message: '接口正忙，请稍后重试' })
      } else {
        // success
        resolve({
          code: 0,
          data: randomNum > 0.05 ? { prodList: [generateProd()] } : { prodList: [] },
          message: 'success'
        })
      }
    })
  }
  return api().then((res) => {
    const { data, code, message } = res
    const prodListLength = data?.prodList?.length ?? 0
    if (code === 0 && prodListLength > 0) {
      return {
        code,
        message,
        data: data?.prodList!
      }
    }
    return Promise.reject({
      code: code === 0 ? -3 : code,
      message: code === 0 ? (data?.prodList?.length ?? 0) === 0 && '购物车无商品' : message
    })
  })
}

export interface ITime {
  startTime: string
  endTime: string
}

/**
 * 获取可配送时间
 */
export function getDeliveryTime({ cookie }: { cookie: string }): Promise<IRes<ITime[]>> {
  console.log('🚀 ~ file: service.ts ~ line 174 ~ getDeliveryTime ~ getDeliveryTime')
  function api(): Promise<{
    data?: {
      timeList: ITime[]
    }
    code: number
    message: string
  }> {
    return new Promise((resolve, reject) => {
      // resolve({
      //   code: 0,
      //   data: {
      //     timeList: [
      //       {
      //         startTime: '09:00',
      //         endTime: '09:30'
      //       },
      //       {
      //         startTime: '10:00',
      //         endTime: '10:30'
      //       }
      //     ]
      //   },
      //   message: 'success'
      // })

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
      return {
        code,
        message,
        data: data?.timeList!
      }
    }
    return Promise.reject({
      code: code === 0 ? -3 : code,
      message: code === 0 ? (data?.timeList?.length ?? 0) === 0 && '无可配送时间' : message
    })
  })
}

/**
 * 下单
 */
export function postOrder({
  cookie,
  prodList,
  time,
  address
}: {
  cookie: string
  prodList: ProdList
  time: ITime
  address: IAddress
}): Promise<IRes> {
  console.log('提交订单', cookie, prodList, time, address)
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
        resolve({ code: -5, message: '选择的时间配送已约满，请重新选择' })
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
      return res
    }
    return Promise.reject({
      code,
      message
    })
  })
}
