/**
 * @name Unsafe use of dangerouslySetInnerHTML
 * @description Detects potential XSS vulnerabilities from unsafe use of dangerouslySetInnerHTML
 * @kind path-problem
 * @problem.severity error
 * @security-severity 8.8
 * @precision high
 * @id js/unsafe-dangerously-set-inner-html
 * @tags security
 *       xss
 *       react
 */

import javascript
import DataFlow
import TaintTracking

/**
 * A taint-tracking configuration for unsafe dangerouslySetInnerHTML usage
 */
class UnsafeDangerouslySetInnerHTMLConfig extends TaintTracking::Configuration {
  UnsafeDangerouslySetInnerHTMLConfig() {
    this = "UnsafeDangerouslySetInnerHTML"
  }

  override predicate isSource(DataFlow::Node source) {
    // User-controlled data sources
    source instanceof RemoteFlowSource or
    // URL parameters
    source = any(UrlSearchParams usp).getAMethodCall("get") or
    // Form data
    source = any(DOM::Element elem).getAPropertyRead("value") or
    // Props that might contain user data
    source = any(ReactComponent comp).getAPropertyRead()
  }

  override predicate isSink(DataFlow::Node sink) {
    // dangerouslySetInnerHTML property assignments
    exists(PropWriteNode pwn |
      pwn.getPropertyName() = "dangerouslySetInnerHTML" and
      sink = pwn.getRhs().getAPropertyRead("__html")
    )
  }

  override predicate isSanitizer(DataFlow::Node node) {
    // DOMPurify sanitization
    node = any(CallExpr call | call.getCalleeName() = "sanitize").getAnArgument() or
    // Custom sanitization functions
    node = any(CallExpr call | call.getCalleeName().regexpMatch(".*sanitize.*|.*escape.*|.*clean.*")).getAnArgument()
  }
}

from UnsafeDangerouslySetInnerHTMLConfig config, DataFlow::PathNode source, DataFlow::PathNode sink
where config.hasFlowPath(source, sink)
select sink.getNode(), source, sink,
  "Potential XSS vulnerability: User-controlled data flows to dangerouslySetInnerHTML without sanitization."