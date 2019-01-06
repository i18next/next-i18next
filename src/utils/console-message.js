/* eslint-disable no-console */

/**
  * @readonly
  * @enum {String} A console.log type
  */
const messageTypes = {
  error: 'error',
  info: 'info',
  warn: 'warn',
}

Object.freeze(messageTypes)

/**
 *  Logs a custom message to console
 * @param {PrettyError} PrettyError
 * @param {messageTypes} messageType One of: error, warn or info
 * @param {String} message
 */
function logMessage(PrettyError, messageType, message) {
  const capitalize = str => str.replace(str[0], str[0].toUpperCase())

  const pe = new PrettyError()

  // Create a new empty error
  const newLog = new Error()

  // Set the new error message
  newLog.message = message

  if (Object.values(messageTypes).includes(messageType)) {
    newLog.name = capitalize(messageTypes[messageType])
    console[messageType](pe.render(newLog))
  } else {
    newLog.name = capitalize(messageTypes.info)
    console.info(pe.render(newLog))
  }

}

/**
 * Create a console log with specified log type, a message and options
 * @param {messageTypes} messageType One of: error, warn or info
 * @param {String} message
 * @param {Object} options
 */
export default function createConsoleLog(messageType, message) {

  const { errorStackTraceLimit, strictMode } = this.config

  const prevStackLimit = Error.stackTraceLimit
  Error.stackTraceLimit = errorStackTraceLimit

  let util
  let PrettyError
  let pe

  if (!strictMode) {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    util = require('util')
    PrettyError = require('pretty-error')

    pe = new PrettyError()

  } else {
    return
  }

  /* Temporarily set the stacktrace to 0 or errorStackTraceLimit,
     in order to only display a message */
  Error.errorStackTraceLimit = errorStackTraceLimit

  // Make room for new message
  console.log()

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

  // Log the message to console
  logMessage(PrettyError, messageType, message)

  // Reset stack limit
  Error.stackTraceLimit = prevStackLimit

}
