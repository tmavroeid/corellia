const winston = require('winston')
const { format } = winston

const formatter = ({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} ${level}: ${stack}`
  } else {
    return `${timestamp} ${level}: ${message}`
  }
}

const transports = []

// Add console transport by default
transports.push(
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.splat(),
      format.printf(formatter)
    )
  })
)

// Configure global logger defaults
winston.configure({
  levels: winston.config.syslog.levels,
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(),
    format.printf(formatter)
  ),
  transports: transports
})

module.exports = winston
