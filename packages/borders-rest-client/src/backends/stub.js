// eslint-disable-next-line import/no-extraneous-dependencies
import sinon from 'sinon'

import { GET } from '../commands/get'
import { POST } from '../commands/post'
import { DELETE } from '../commands/delete'
import { STUB_CALL } from '../test-commands/stub-call'

const supportedResponseProperties = [
  'status', 'body', 'headers',
]

function validateHeaders(response) {
  if (response.headers) {
    for (const headerKey of Object.keys(response.headers)) {
      if (headerKey !== headerKey.toLowerCase()) {
        throw new Error(`The header "${headerKey}" should be lower case`)
      }
    }
  }
}

function validateProperties(response) {
  for (const responseProperty of Object.keys(response)) {
    if (!supportedResponseProperties.includes(responseProperty)) {
      throw new Error(`The response property "${responseProperty}" is not supported`)
    }
  }
}

export default () => {
  const stub = sinon.stub()

  const stubRequest = (method, request, response) => {
    validateHeaders(response)
    validateProperties(response)

    stub.withArgs(sinon.match({
      method: method.toLowerCase(),
      ...request,
    })).returns(response)
  }

  const getStubbedResponse = (method, request) =>
    stub({
      method: method.toLowerCase(),
      ...request,
    })

  const backend = {
    async [STUB_CALL]({ method, request, response }) {
      stubRequest(method, request, response)
    },
    async [GET]({ request }) {
      return getStubbedResponse('get', request)
    },
    async [POST]({ request }) {
      return getStubbedResponse('post', request)
    },
    async [DELETE]({ request }) {
      return getStubbedResponse('delete', request)
    },
  }

  return backend
}
