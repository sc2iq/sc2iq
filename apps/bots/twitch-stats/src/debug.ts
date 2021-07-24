import debug from 'debug'
import dotenv from 'dotenv'

// Does not work because DEBUG env vars evaluated on import not at instance creation
// https://github.com/visionmedia/debug/issues/783
// Use startDebug command to set variables when node is executed
dotenv.config()

const baseDebug = debug('twitchstats')

export const debugVerbose = baseDebug.extend('verbose')
export const debugInfo = baseDebug.extend('info')