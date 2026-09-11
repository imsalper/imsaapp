const { callClaude } = require("../lib/anthropic");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 gerekli" });
      return;
    }
    const system = `Sen bir nalbur/hırdavat ürün fotoğrafını analiz eden asistansın. Fotoğraftaki ürünü tanı. SADECE geçerli JSON döndür, başka hiçbir açıklama ekleme: {"name":"ürün adı","category":"Nalbur, Hırdavat, Elektrik, Sıhhi Tesisat, Boya, El Aletleri, Bahçe, Diğer kategorilerinden biri","detectedPrice": fotoğrafta bir fiyat etiketi görüyorsan sayı, yoksa null,"description":"kısa açıklama"}`;
    const messages = [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } },
          { type: "text", text: "Bu ürünü analiz et." },
        ],
      },
    ];
    const reply = await callClaude(messages, system, 500);
    let result;
    try {
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : reply);
    } catch (e) {
      throw new Error("Yapay zeka çıktısı okunamadı: " + reply.slice(0, 300));
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
