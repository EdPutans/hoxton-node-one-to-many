
import { Response as IResponse } from 'express';


export type Resp<T> = IResponse<{ data: T } | { error: string }>

export type Work = {
  title: string,
  artist: string,
  year: number,
  museum_id: number
  museum?: Museum
}

export type Museum = {
  id: number,
  name: string,
  address: string
  works?: Work[]
}
