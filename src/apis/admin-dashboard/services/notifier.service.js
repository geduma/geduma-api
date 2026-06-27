const NTFY_TOPIC = process.env.ADMIN_NTFY_TOPIC

export async function notify ({ title, message, priority = 5 }) {
  if (!NTFY_TOPIC) return
  await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: 'POST',
    body: JSON.stringify({ topic: NTFY_TOPIC, title, message, priority, tags: ['warning'] }),
    headers: { 'Content-Type': 'application/json' }
  }).catch(() => {})
}
