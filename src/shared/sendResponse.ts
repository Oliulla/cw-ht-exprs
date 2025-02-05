import { Response } from "express"

type IApiReponse<T> = {
  success: boolean
  statusCode: number
  message?: string | null
  meta?: {
    page: number
    limit: number
    total: number
  }
  data?: T | null
}

const sendResponse = <T>(res: Response, data: IApiReponse<T>): void => {
  const responseData: IApiReponse<T> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message || null,
    meta: data.meta,
    data: data.data || null,
  }

  res.status(data.statusCode).json(responseData)
}

export default sendResponse
