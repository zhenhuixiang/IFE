var baseUrl = ''

export default async(url = '', data = {}, type = 'post', method = 'fetch') => {
  type = type.toUpperCase()
  url = baseUrl + url

  let dataStr = '' // 数据拼接字符串
  if (type) {
    Object.keys(data).forEach(key => {
      dataStr += key + '=' + data[key] + '&'
    })

    if (dataStr !== '') {
      dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'))
      url = url + '?' + dataStr
    }
  }

  if (window.fetch && method === 'fetch') {
    let requestConfig = {
      method: type,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      mode: 'cors',
      cache: 'force-cache'
    }
    if (type === 'POST') {
      Object.defineProperty(requestConfig, 'body', {
        value: dataStr
      })
    }

    try {
      const response = await fetch(url, requestConfig)
      const responseJson = await response.json()
      console.log(responseJson)
      return responseJson
    } catch (error) {
      throw new Error(error)
    }
  } else {
    return new Promise((resolve, reject) => {
      let requestObj
      if (window.XMLHttpRequest) {
        requestObj = new XMLHttpRequest()
      }

      let sendData = ''
      if (type === 'POST') {
        sendData = JSON.stringify(data)
      }
      console.log(sendData)
      requestObj.open(type, url, true)
      requestObj.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      requestObj.send(dataStr)

      requestObj.onreadystatechange = () => {
        if (requestObj.readyState === 4) {
          if (requestObj.status === 200) {
            let obj = requestObj.response
            if (typeof obj !== 'object') {
              obj = JSON.parse(obj)
            }
            console.log(obj)
            resolve(obj)
          } else {
            reject(requestObj)
          }
        }
      }
    })
  }
}
