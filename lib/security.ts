// Constant-time string comparison. Used for passcode checks (joinQueue, verifyQueuePasscode)
// so an attacker can't infer how many leading digits were correct from response-time
// differences. Precondition: `correct` must be non-empty — an empty string would divide by
// zero in the modulo below (queue.passcode is only ever compared when truthy at call sites).
export function constantTimeEquals(correct: string, provided: string): boolean {
  let mismatch = correct.length ^ provided.length
  for (let i = 0; i < Math.max(correct.length, provided.length); i++) {
    mismatch |= (correct.charCodeAt(i % correct.length) ^ provided.charCodeAt(i % provided.length))
  }
  return mismatch === 0
}

// Real browser push services only — the endpoint is client-supplied and the server later
// makes an outbound HTTP request to it (via web-push, when a merchant calls "next"). Without
// this allowlist, a caller could supply an internal/cloud-metadata URL and turn every
// "Call Next" click into an SSRF trigger.
const ALLOWED_PUSH_HOSTS = [
  /(^|\.)googleapis\.com$/,                  // Chrome, Edge, Opera, Samsung Internet (FCM)
  /^updates\.push\.services\.mozilla\.com$/, // Firefox
  /(^|\.)push\.apple\.com$/,                 // Safari
  /(^|\.)notify\.windows\.com$/,             // Legacy Edge (EdgeHTML)
]

export function isValidPushEndpoint(endpoint: string): boolean {
  let url: URL
  try {
    url = new URL(endpoint)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  return ALLOWED_PUSH_HOSTS.some(re => re.test(url.hostname))
}
