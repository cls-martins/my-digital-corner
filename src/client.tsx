import { createStartHandler } from '@tanstack/react-start/client'
import { getRouter } from './router' // Nome do seu arquivo de router na src

const router = getRouter()
const handler = createStartHandler({ router })

handler()
