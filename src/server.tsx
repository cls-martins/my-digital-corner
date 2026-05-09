import { createRequestHandler } from 'vinxi/http'

export default createRequestHandler({
  handler: (event) => {
    return 'Server handler'
  },
})
