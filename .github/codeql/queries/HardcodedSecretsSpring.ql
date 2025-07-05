/**
 * @name Hardcoded secrets in Spring Boot configuration
 * @description Detects potential hardcoded secrets in Spring Boot application properties
 * @kind problem
 * @problem.severity error
 * @security-severity 8.5
 * @precision high
 * @id kotlin/hardcoded-secrets-spring
 * @tags security
 *       secrets
 *       spring-boot
 */

import kotlin
import semmle.code.kotlin.dataflow.DataFlow

/**
 * Holds if `expr` is a potential secret value
 */
predicate isPotentialSecret(Expr expr) {
  exists(StringLiteral lit |
    lit = expr and
    (
      // Look for long strings that might be secrets
      lit.getValue().length() > 20 or
      // Look for common secret patterns
      lit.getValue().regexpMatch(".*[a-zA-Z0-9]{32,}.*") or
      // Look for base64-like strings
      lit.getValue().regexpMatch(".*[A-Za-z0-9+/]{20,}={0,2}.*") or
      // Look for hex-like strings
      lit.getValue().regexpMatch(".*[a-fA-F0-9]{32,}.*")
    )
  )
}

/**
 * Holds if `prop` is a sensitive property name
 */
predicate isSensitiveProperty(string prop) {
  prop.regexpMatch("(?i).*(password|secret|key|token|credential|private).*")
}

from Assignment assign, StringLiteral value, string propName
where
  assign.getAnAssignedValue() = value and
  isPotentialSecret(value) and
  exists(string assignedVar |
    assignedVar = assign.getDestVar().getName().toLowerCase() and
    isSensitiveProperty(assignedVar) and
    propName = assignedVar
  )
select assign, "Potential hardcoded secret in property: " + propName