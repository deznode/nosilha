/**
 * @name Unsafe JWT token handling
 * @description Detects potential unsafe JWT token handling patterns
 * @kind problem
 * @problem.severity warning
 * @security-severity 7.0
 * @precision medium
 * @id kotlin/unsafe-jwt-handling
 * @tags security
 *       jwt
 *       authentication
 */

import kotlin
import semmle.code.kotlin.dataflow.DataFlow

/**
 * Holds if `call` is a JWT parsing method call
 */
predicate isJwtParseCall(MethodCall call) {
  call.getMethodName().regexpMatch(".*parse.*") and
  call.getReceiverType().toString().regexpMatch(".*Jwt.*|.*Token.*")
}

/**
 * Holds if `call` lacks proper validation
 */
predicate lacksValidation(MethodCall call) {
  isJwtParseCall(call) and
  not exists(MethodCall validation |
    validation.getMethodName().regexpMatch(".*verify.*|.*validate.*") and
    validation.getAnArgument() = call
  )
}

from MethodCall jwtCall
where lacksValidation(jwtCall)
select jwtCall, "JWT token parsing without proper validation detected"