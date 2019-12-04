/* eslint-disable no-console */

type MessageType = 'error' | 'info' | 'warn'

const messageTypes = {
  error: 'error',
  info: 'info',
  warn: 'warn',
}

Object.freeze(messageTypes)

const logMessage = (messageType: MessageType, message: string) => {
  if (Object.values(messageTypes).includes(messageType)) {
    console[messageType](message)
  } else {
    console.info(message)
  }
}

export const consoleMessage = function (messageType: MessageType, message: string) {

  const { errorStackTraceLimit, strictMode } = this.config

  const prevStackLimit = Error.stackTraceLimit

  let util

  if (!strictMode) {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    util = require('util')
  } else {
    return
  }

  /*
    Temporarily set the stacktrace to 0 or errorStackTraceLimit,
    in order to only display a message
  */
  Error.stackTraceLimit = errorStackTraceLimit

  /*
    Make room for new message
  */
  console.log()

  /*
    Make sure the message is a string
  */
  if (typeof message !== 'string') {
    const metaError = new Error()
    metaError.name = 'Meta'
    metaError.message = `Param message needs to be of type: string. Instead, '${typeof message}' was provided.\n
------------------------------------------------\n
\u200b
        The provided ${typeof message}:\n
\u200b
          ${util.inspect(message, true, 8, true)}
\u200b
------------------------------------------------\n
    `
    console.error(metaError)
    return
  }

  /*
    Log the message to console
  */
  logMessage(messageType, message)

  /*
    Reset stack limit
  */
  Error.stackTraceLimit = prevStackLimit

}
