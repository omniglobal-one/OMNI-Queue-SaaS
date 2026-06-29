import webpush from 'web-push'

let vapidInitialized = false

function ensureVapid() {
  if (vapidInitialized) return
  const subject = process.env.VAPID_SUBJECT
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!subject || !publicKey || !privateKey || publicKey.startsWith('REPLACE')) return
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidInitialized = true
}

export async function sendPushNotification({
  subscription,
  payload,
}: {
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
  payload: { title: string; body: string; ticketUrl: string; ticketId: string }
}): Promise<void> {
  ensureVapid()
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    },
    JSON.stringify(payload)
  )
}
