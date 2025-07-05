/**
 * @name Insecure API endpoint configuration
 * @description Detects API endpoints that might be missing authentication or have overly permissive access
 * @kind problem
 * @problem.severity warning
 * @security-severity 6.5
 * @precision medium
 * @id js/insecure-api-endpoint
 * @tags security
 *       authentication
 *       api
 */

import javascript

/**
 * Holds if `call` is an API route definition
 */
predicate isApiRouteDefinition(CallExpr call) {
  call.getCalleeName().regexpMatch("get|post|put|delete|patch") and
  exists(MemberExpr member |
    member = call.getReceiver() and
    member.getPropertyName().regexpMatch(".*router.*|.*app.*")
  )
}

/**
 * Holds if `call` has authentication middleware
 */
predicate hasAuthMiddleware(CallExpr call) {
  exists(CallExpr middleware |
    middleware.getAnArgument().toString().regexpMatch(".*auth.*|.*jwt.*|.*authenticate.*") and
    middleware.getParent+() = call
  )
}

/**
 * Holds if `route` handles sensitive data operations
 */
predicate handlesSensitiveOperations(CallExpr route) {
  exists(string path |
    path = route.getArgument(0).toString() and
    (
      path.regexpMatch(".*/admin/.*") or
      path.regexpMatch(".*/user.*") or
      path.regexpMatch(".*/profile.*") or
      path.regexpMatch(".*/delete.*") or
      path.regexpMatch(".*/create.*") or
      route.getCalleeName().regexpMatch("post|put|delete|patch")
    )
  )
}

from CallExpr route
where
  isApiRouteDefinition(route) and
  handlesSensitiveOperations(route) and
  not hasAuthMiddleware(route)
select route, "API endpoint handling sensitive operations without apparent authentication middleware"