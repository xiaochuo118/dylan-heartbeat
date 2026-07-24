const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      realtime: { enabled: false }
    });
  }
  return supabase;
}

async function saveMessage(role, content) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from("messages").insert({ role, content });
  } catch (err) {
    console.error("Supabase 写入失败:", err.message);
  }
}

async function getLastUserTime() {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("messages")
      .select("created_at")
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return new Date(data[0].created_at);
  } catch (err) {
    console.error("Supabase 读取失败:", err.message);
    return null;
  }
}

async function getRecentMessages(limit = 30) {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("messages")
      .select("role, content, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.reverse();
  } catch (err) {
    console.error("Supabase 读取失败:", err.message);
    return [];
  }
}

module.exports = { getSupabase, saveMessage, getLastUserTime, getRecentMessages };

