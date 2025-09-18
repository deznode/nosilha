/**
 * Structured logging system for the Nos Ilha platform
 * Provides consistent, contextual logging with proper log levels and formatting
 */

import { env, isDebugEnabled } from "@/lib/env";

// ================================
// LOG LEVELS AND TYPES
// ================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  error?: Error;
}

// ================================
// LOGGING CONFIGURATION
// ================================

interface LoggerConfig {
  enableConsole: boolean;
  enableDebug: boolean;
  includeTimestamp: boolean;
  includeComponent: boolean;
  maxContextLength: number;
}

const config: LoggerConfig = {
  enableConsole: true,
  enableDebug: isDebugEnabled(),
  includeTimestamp: !env.isProd,
  includeComponent: true,
  maxContextLength: 1000,
};

// ================================
// CORE LOGGING FUNCTIONS
// ================================

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  component?: string,
  action?: string,
  error?: Error
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    component,
    action,
    error,
  };
}

/**
 * Format log entry for console output
 */
function formatForConsole(entry: LogEntry): string {
  const parts: string[] = [];

  // Add timestamp in development
  if (config.includeTimestamp) {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    parts.push(`[${time}]`);
  }

  // Add log level
  const levelEmojis = {
    debug: "🔍",
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
  };
  parts.push(`${levelEmojis[entry.level]} ${entry.level.toUpperCase()}`);

  // Add component if available
  if (entry.component && config.includeComponent) {
    parts.push(`[${entry.component}]`);
  }

  // Add action if available
  if (entry.action) {
    parts.push(`{${entry.action}}`);
  }

  // Add main message
  parts.push(entry.message);

  return parts.join(" ");
}

/**
 * Log a structured entry to console
 */
function logToConsole(entry: LogEntry): void {
  if (!config.enableConsole) return;

  // Skip debug logs in production
  if (entry.level === "debug" && !config.enableDebug) return;

  const message = formatForConsole(entry);

  // Use appropriate console method
  switch (entry.level) {
    case "debug":
      console.debug(message, entry.context || "");
      break;
    case "info":
      console.info(message, entry.context || "");
      break;
    case "warn":
      console.warn(message, entry.context || "");
      if (entry.error) console.warn(entry.error);
      break;
    case "error":
      console.error(message, entry.context || "");
      if (entry.error) console.error(entry.error);
      break;
  }
}

/**
 * Core logging function
 */
function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
  component?: string,
  action?: string,
  error?: Error
): void {
  const entry = createLogEntry(
    level,
    message,
    context,
    component,
    action,
    error
  );

  // Log to console
  logToConsole(entry);

  // In production, you might want to send logs to an external service
  if (env.isProd && entry.level === "error") {
    // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
  }
}

// ================================
// PUBLIC LOGGING API
// ================================

export const logger = {
  /**
   * Debug logging - only shown in development
   */
  debug(
    message: string,
    context?: LogContext,
    component?: string,
    action?: string
  ): void {
    log("debug", message, context, component, action);
  },

  /**
   * Info logging - general application information
   */
  info(
    message: string,
    context?: LogContext,
    component?: string,
    action?: string
  ): void {
    log("info", message, context, component, action);
  },

  /**
   * Warning logging - something unexpected but not breaking
   */
  warn(
    message: string,
    context?: LogContext,
    component?: string,
    action?: string
  ): void {
    log("warn", message, context, component, action);
  },

  /**
   * Error logging - something went wrong
   */
  error(
    message: string,
    error?: Error,
    context?: LogContext,
    component?: string,
    action?: string
  ): void {
    log("error", message, context, component, action, error);
  },

  /**
   * API request logging
   */
  apiRequest(
    method: string,
    url: string,
    status?: number,
    duration?: number,
    component = "API"
  ): void {
    const context = { method, url, status, duration };
    const message = `${method} ${url}`;

    if (status && status >= 400) {
      this.warn(message, context, component, "request");
    } else {
      this.debug(message, context, component, "request");
    }
  },

  /**
   * API error logging
   */
  apiError(
    method: string,
    url: string,
    error: Error,
    status?: number,
    component = "API"
  ): void {
    const context = { method, url, status };
    const message = `${method} ${url} failed`;

    this.error(message, error, context, component, "request");
  },

  /**
   * User action logging
   */
  userAction(action: string, context?: LogContext, component?: string): void {
    this.info(`User action: ${action}`, context, component, "user");
  },

  /**
   * Performance logging
   */
  performance(
    operation: string,
    duration: number,
    context?: LogContext,
    component?: string
  ): void {
    const perfContext = { ...context, duration: `${duration}ms` };
    this.debug(`Performance: ${operation}`, perfContext, component, "perf");
  },

  /**
   * Validation error logging
   */
  validationError(
    field: string,
    value: unknown,
    rule: string,
    component?: string
  ): void {
    const context = { field, value, rule };
    this.warn(`Validation failed: ${field}`, context, component, "validation");
  },

  /**
   * Authentication logging
   */
  auth(
    action: "login" | "logout" | "signup" | "token_refresh",
    userId?: string
  ): void {
    const context = { userId };
    this.info(`Authentication: ${action}`, context, "Auth", action);
  },

  /**
   * Navigation logging
   */
  navigation(from: string, to: string): void {
    const context = { from, to };
    this.debug("Navigation", context, "Router", "navigate");
  },
};

// ================================
// SPECIALIZED LOGGERS
// ================================

/**
 * Create a component-specific logger
 */
export function createComponentLogger(component: string) {
  return {
    debug: (message: string, context?: LogContext, action?: string) =>
      logger.debug(message, context, component, action),
    info: (message: string, context?: LogContext, action?: string) =>
      logger.info(message, context, component, action),
    warn: (message: string, context?: LogContext, action?: string) =>
      logger.warn(message, context, component, action),
    error: (
      message: string,
      error?: Error,
      context?: LogContext,
      action?: string
    ) => logger.error(message, error, context, component, action),
  };
}

/**
 * Measure execution time of an operation
 */
export function measureTime<T>(
  operation: string,
  fn: () => T | Promise<T>,
  component?: string
): T | Promise<T> {
  const start = performance.now();

  const result = fn();

  if (result instanceof Promise) {
    return result.then(
      (value) => {
        const duration = performance.now() - start;
        logger.performance(operation, duration, undefined, component);
        return value;
      },
      (error) => {
        const duration = performance.now() - start;
        logger.performance(operation, duration, { error: true }, component);
        throw error;
      }
    );
  } else {
    const duration = performance.now() - start;
    logger.performance(operation, duration, undefined, component);
    return result;
  }
}

/**
 * Log function entry and exit (useful for debugging)
 */
export function logFunction<T extends (...args: unknown[]) => unknown>(
  fn: T,
  name: string,
  component?: string
): T {
  return ((...args: Parameters<T>) => {
    logger.debug(`Entering ${name}`, { args }, component, "function");

    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result.then(
          (value) => {
            logger.debug(
              `Exiting ${name}`,
              { success: true },
              component,
              "function"
            );
            return value;
          },
          (error) => {
            logger.debug(
              `Exiting ${name}`,
              { success: false, error },
              component,
              "function"
            );
            throw error;
          }
        );
      } else {
        logger.debug(
          `Exiting ${name}`,
          { success: true },
          component,
          "function"
        );
        return result;
      }
    } catch (error) {
      logger.debug(
        `Exiting ${name}`,
        { success: false, error },
        component,
        "function"
      );
      throw error;
    }
  }) as T;
}

// ================================
// CONFIGURATION
// ================================

/**
 * Update logger configuration
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  Object.assign(config, newConfig);
}

/**
 * Get current logger configuration
 */
export function getLoggerConfig(): Readonly<LoggerConfig> {
  return { ...config };
}

// ================================
// LEGACY CONSOLE REPLACEMENT
// ================================

/**
 * Legacy console.log replacement - use logger.info instead
 * @deprecated Use logger.info() instead
 */
export function consolelog(message: string, context?: LogContext): void {
  logger.info(message, context, "Legacy");
}

/**
 * Legacy console.warn replacement - use logger.warn instead
 * @deprecated Use logger.warn() instead
 */
export function consoleWarn(message: string, context?: LogContext): void {
  logger.warn(message, context, "Legacy");
}

/**
 * Legacy console.error replacement - use logger.error instead
 * @deprecated Use logger.error() instead
 */
export function consoleError(
  message: string,
  error?: Error,
  context?: LogContext
): void {
  logger.error(message, error, context, "Legacy");
}
