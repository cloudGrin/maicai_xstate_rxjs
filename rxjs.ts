/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  catchError,
  combineLatest,
  defer,
  EMPTY,
  from,
  iif,
  map,
  mergeMap,
  mergeWith,
  of,
  ReplaySubject,
  retry,
  Subject,
  switchMap,
  tap,
  throwError,
  timer
} from 'rxjs'
import type { IConfig, ITime } from './service.js'
import { getAddress, getCart, getConfig, getDeliveryTime, postOrder } from './service.js'

const start$$ = new Subject()
const getCart$$ = new ReplaySubject<IConfig>(1)
const getDeliveryTime$$ = new ReplaySubject<IConfig>(1)

const config$ = start$$.pipe(
  switchMap(() => from(getConfig())),
  catchError((err: unknown) => {
    console.log('getConfig error', err)
    return EMPTY
  })
)

const address$ = config$.pipe(
  switchMap((config) =>
    from(defer(() => getAddress({ cookie: config.cookie })))
      .pipe(
        map(({ data: address }) => {
          return {
            config,
            address
          }
        }),
        retry({
          delay: (error) =>
            iif(
              () => error.code === -2,
              of('').pipe(
                tap(() => console.log('getAddress retry')),
                mergeMap(() => timer(1000))
              ),
              throwError(() => error)
            )
        }),
        catchError((err: unknown) => {
          console.log('getAddress error', err)
          return EMPTY
        })
      )
      .pipe(
        tap(() => {
          getCart$$.next(config)
          getDeliveryTime$$.next(config)
        })
      )
  )
)

const cart$ = getCart$$.pipe(
  mergeMap((config) =>
    from(defer(() => getCart({ cookie: config.cookie }))).pipe(
      map(({ data }) => data),
      retry({
        delay: (error) =>
          iif(
            () => error.code === -2,
            of('').pipe(
              tap(() => console.log('getCart retry')),
              mergeMap(() => timer(1000))
            ),
            throwError(() => error)
          )
      }),
      catchError((err: unknown) => {
        console.log('getCart error', err)
        return throwError(() => err)
      })
    )
  )
)

const tryAnotherTime$$ = new Subject<ITime[]>()

const deliveryTime$ = getDeliveryTime$$.pipe(
  switchMap((config) =>
    from(defer(() => getDeliveryTime({ cookie: config.cookie }))).pipe(
      map(({ data }) => data),
      retry({
        delay: (error) =>
          iif(
            () => error.code === -2,
            of('').pipe(
              tap(() => console.log('getDeliveryTime retry')),
              mergeMap(() => timer(1000))
            ),
            throwError(() => error)
          )
      }),
      catchError((err: unknown) => {
        console.log('getDeliveryTime error', err)
        return throwError(() => err)
      })
    )
  ),
  mergeWith(tryAnotherTime$$)
)

const order$ = address$.pipe(
  switchMap(({ config, address }) =>
    combineLatest([cart$, deliveryTime$]).pipe(
      map(([prodList, deliveryTime]) => {
        return {
          prodList,
          deliveryTime
        }
      }),
      switchMap(({ prodList, deliveryTime }) =>
        from(
          defer(() =>
            postOrder({ cookie: config.cookie, prodList: prodList!, time: deliveryTime![0], address: address! })
          )
        ).pipe(
          retry({
            delay: (error) =>
              iif(
                () => error.code === -2,
                of('').pipe(
                  tap(() => console.log('postOrder retry')),
                  mergeMap(() => timer(1000))
                ),
                throwError(() => error)
              )
          }),
          catchError((err: any) => {
            if (err.code === -4) {
              console.log('商品已售罄')
              getCart$$.next(config)
            } else if (err.code === -5) {
              if (deliveryTime!.length > 1) {
                console.log('选择的时间配送已约满，请重新选择')
                tryAnotherTime$$.next(deliveryTime!.slice(1))
              } else {
                console.log('无可用配送时间')
              }
            } else {
              console.log('postOrder error', err)
            }
            return EMPTY
          })
        )
      ),
      catchError((err: unknown) => {
        return EMPTY
      })
    )
  )
)

order$.subscribe((v) => {
  console.log('order result', v)
})

start$$.next(true)
