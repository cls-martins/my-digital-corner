import { createStartHandler } from '@tanstack/react-start/client'
import { createRouter } from './router'

const router = createRouter()
const handler = createStartHandler({ router })

handler()
