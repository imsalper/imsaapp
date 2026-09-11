const { callClaude } = require("../lib/anthropic");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { messages, stock } = req.body || {};
    const system = `Sen İmsaApp adlı bir nalbur/hırdavat dükkanı için stok ve fiyat asistanısın. Kullanıcı sana ürün fiyatları, stok durumu, kategoriler hakkında soru sorabilir ya da genel sohbet edebilir. Kısa, net, samimi Türkçe yanıt ver.\n\nMevcut stok listesi (JSON, kısaltılmış olabilir): ${JSON.stringify(stock || []).slice(0, 6000)}`;
    const reply = await callClaude(messages || [], system, 800);
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
