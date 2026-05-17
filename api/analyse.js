import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, text, imageBase64, mimeType } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    const systemPrompt = `You are a sales assistant AI. Extract follow-up information from WhatsApp conversations.
Today is ${today}. Reply ONLY with valid JSON, no markdown, no preamble.
Return exactly:
{
  "clientName": "name of the person who is NOT the sales rep",
  "followUpDate": "YYYY-MM-DD",
  "stage": "one short phrase for what is pending (max 6 words)",
  "eventTitle": "Follow up — [name] re: [topic]",
  "summary": "2-3 sentences: what was discussed and what action is needed next"
}
If a specific follow-up date is mentioned use it. Otherwise suggest 3 business days from today.`;

    let userContent;

    if (type === 'image') {
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: 'Missing image data' });
      }
      userContent = [
        {
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: imageBase64 }
        },
        { type: 'text', text: 'Extract follow-up details from this WhatsApp screenshot.' }
      ];
    } else {
      if (!text) return res.status(400).json({ error: 'Missing text' });
      userContent = `Extract follow-up details from this WhatsApp conversation:\n\n${text}`;
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }]
    });

    const raw = message.content.find(b => b.type === 'text')?.text || '';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return res.status(200).json({ success: true, data: parsed });

  } catch (err) {
    console.error('Analyse error:', err);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}
