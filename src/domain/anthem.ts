import { z } from './validation'

export const anthemSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('available'),
    src: z.string().regex(/^\/audio\/anthems\/[a-z]{2}\.mp3$/),
    title: z.string().min(1),
    duration: z.number().positive(),
    attribution: z.string().min(1),
    sourcePage: z.url().startsWith('https://commons.wikimedia.org/'),
    license: z.string().min(1),
    licenseUrl: z.url({ protocol: /^https$/ }),
    notice: z.string().min(1),
  }),
  z.object({
    status: z.literal('unavailable'),
    reason: z.string().min(1),
  }),
])

export type Anthem = z.infer<typeof anthemSchema>
export type AvailableAnthem = Extract<Anthem, { status: 'available' }>
