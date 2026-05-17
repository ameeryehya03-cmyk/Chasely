import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { accessToken, title, startDateTime, endDateTime, description } = req.body;

    if (!accessToken || !title || !startDateTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth });

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        description: description || '',
        start: { dateTime: startDateTime, timeZone: 'Asia/Dubai' },
        end: { dateTime: endDateTime, timeZone: 'Asia/Dubai' },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 60 }
          ]
        }
      }
    });

    return res.status(200).json({
      success: true,
      eventId: event.data.id,
      eventLink: event.data.htmlLink
    });

  } catch (err) {
    console.error('Calendar error:', err);
    return res.status(500).json({ error: 'Failed to create calendar event.' });
  }
}
