/* eslint-disable @typescript-eslint/no-namespace */

import type { AuthUser } from '../../auth/auth.types'

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUser {}
  }
}
export {}
