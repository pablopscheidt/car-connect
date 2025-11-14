import { extname } from 'path'
import { randomBytes } from 'crypto'
import type { Request } from 'express'
import type { FileFilterCallback } from 'multer'

export function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) {
  const allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ]
  if (!allowed.includes(file.mimetype))
    return callback(new Error('Arquivo inválido (somente imagens)'))
  callback(null, true)
}

export function generateFileName(
  _req: Request,
  file: Express.Multer.File,
  callback: (e: Error | null, name: string) => void,
) {
  const id = randomBytes(8).toString('hex')
  callback(
    null,
    `${Date.now()}_${id}${extname(file.originalname).toLowerCase()}`,
  )
}
