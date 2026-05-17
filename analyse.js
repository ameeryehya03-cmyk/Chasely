import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone, role, company } = req.body;

    if (!firstName || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      // Return success anyway — just log them in silently
      return res.status(200).json({ success: true, returning: true });
    }

    // Save new lead
    const { error } = await supabase.from('leads').insert({
      first_name: firstName.trim(),
      last_name: lastName?.trim() || '',
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      role: role.trim(),
      company: company?.trim() || '',
      source: 'chasely_web',
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    return res.status(200).json({ success: true, returning: false });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to save. Please try again.' });
  }
}
