import { createStartHandler } from '@tanstack/react-start/client'
import { getRouter } from './router' // Ajuste o caminho para onde está seu arquivo de router

const router = getRouter()
const handler = createStartHandler({ router })

handler()
