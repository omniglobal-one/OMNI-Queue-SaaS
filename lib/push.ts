import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification({
  subscription,
  payload,
}: {
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
  payload: { title: string; body: string; ticketUrl: string; ticketId: string }
}): Promise<void> {
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    },
    JSON.stringify(payload)
  )
}
