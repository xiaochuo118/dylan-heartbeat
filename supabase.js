const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function getHeaders() {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
  };
}

function isConfigured() {
  return !!(SUPABASE_URL && SUPABASE_KEY);
}

async function saveMessage(role, content) {
  if (!isConfigured()) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ role, content })
    });
  } catch (err) {
    console.error("Supabase 写入失败:", err.message);
  }
}

async function getLastUserTime() {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?role=eq.user&order=created_at.desc&limit=1&select=created_at`,
      { headers: getHeaders() }
    );
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return new Date(data[0].created_at);
  } catch (err) {
    console.error("Supabase 读取失败:", err.message);
    return null;
  }
}

async function getRecentMessages(limit = 30) {
  if (!isConfigured()) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?order=created_at.desc&limit=${limit}&select=role,content,created_at`,
      { headers: getHeaders() }
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.reverse();
  } catch (err) {
    console.error("Supabase 读取失败:", err.message);
    return [];
  }
}

module.exports = { saveMessage, getLastUserTime, getRecentMessages };

