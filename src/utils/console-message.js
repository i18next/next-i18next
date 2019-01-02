/* eslint-disable no-console */


/**
  * @readonly
  * @enum {String} A console.log type
  */
const messageTypes = {
  warn: 'Warning',
  err: 'Error',
  info: 'Info',
}

Object.freeze(messageTypes)

/**
 * Sets the Error.stackTraceLimit to default or traceLimit
 * https://v8.dev/docs/stack-trace-api
 * @param {number} traceLimit
 * @returns
 */
function setStackTraceLimit(traceLimit = 10) {
  Error.stackTraceLimit = traceLimit
}


/**
 * Create a console log with specified type, message and options
 * @param {messageTypes} messageType One of: err, warn or info
 * @param {String} message
 * @param {Object} options
 */
export default function createConsoleLog(
  messageType = messageTypes.info,
  message,
  options = {
    traceLimit: 0,
    strictMode: true,
  }) {
  const { traceLimit, strictMode } = options
  let util
  let PrettyError

  if (!strictMode) {
    return
  }

  if (process.env.NODE_ENV === 'test jest') {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    util = require('util')
    PrettyError = require('pretty-error')
  } else {
    return
  }

  const pe = new PrettyError()

  /* Temporarily set the stacktrace to 0 or traceLimit, in order to only display a message */
  Error.stackTraceLimit = traceLimit
  /* Make room for new message */
  console.log()
  // Create a new empty error
  const newLog = new Error()

  // Make sure the message is a string
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
    console.error(pe.render(metaError))
    return
  }

  // Set the new error message
  newLog.message = message

  switch (messageType) {
    case 'warn':
      newLog.name = messageTypes.warn
      console.warn(pe.render(newLog))
      setStackTraceLimit()
      return
    case 'err':
      newLog.name = messageTypes.err
      console.error(pe.render(newLog))
      setStackTraceLimit()
      return
    case 'info':
      newLog.name = messageTypes.info
      console.info(pe.render(newLog))
      setStackTraceLimit()
      return
    default:
      newLog.name = messageTypes.info
      console.info(pe.render(newLog))
      setStackTraceLimit()
  }
}
