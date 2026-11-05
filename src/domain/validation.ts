import { z } from 'zod'

// Strict CSP forbids dynamic compilation, including feature-detection probes.
z.config({ jitless: true })

export { z }
