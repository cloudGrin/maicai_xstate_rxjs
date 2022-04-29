function parseProduct(productMap) {
  const { id, product_name, price, count, total_price, origin_price, sizes } = productMap
  return {
    id,
    // TODO 确认是否是小驼峰
    productName: product_name,
    price,
    count,
    totalPrice: total_price,
    originPrice: origin_price,
    sizes
  }
}

/**
 * 获取购物车接口返回的所有有效商品
 * @param data 购物车接口返回数据
 */
function getEffProd(data) {
  return {
    prodList: data.product.effective.reduce((result, cur) => {
      cur.products?.forEach((item) => {
        result.push(parseProduct(item))
      })
      return result
    }, []),
    parentOrderSign: data.parent_order_info.parent_order_sign
  }
}

/**
 * 获取购物车接口返回的所有勾选商品
 * @param data 购物车接口返回数据
 */
function getCheckProd(data) {
  return {
    prodList: data.new_order_product_list.reduce((result, cur) => {
      cur.products?.forEach((item) => {
        result.push(parseProduct(item))
      })
      return result
    }, []),
    parentOrderSign: data.parent_order_info.parent_order_sign
  }
}

export { getEffProd, getCheckProd }
