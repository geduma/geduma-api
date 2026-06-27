import dotenv from 'dotenv'

dotenv.config()

export async function notify ({ title, message, priority = 5 }) {
  const topic = process.env.ADMIN_NTFY_TOPIC
  if (!topic) return
  await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    body: JSON.stringify({ topic, title, message, priority, tags: ['warning'] }),
    headers: { 'Content-Type': 'application/json' }
  }).catch(() => {})
}
