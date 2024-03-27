import fetch from 'node-fetch';
export async function sendSlackMessage(bottoken: string, message: unknown) {
  return fetch(`https://slack.com/api/chat.postMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bottoken}`,
      'Content-type': 'application/json'
    },
    body: JSON.stringify(message)
  });
}
