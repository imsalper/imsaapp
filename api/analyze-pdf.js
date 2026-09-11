const { callClaude } = require("../lib/anthropic");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { text, kdv, iskonto, karMarji } = req.body || {};
    if (!text || !text.trim()) {
      res.status(400).json({ error: "PDF metni boş geldi." });
      return;
    }
    const system = `Sen bir nalbur/hırdavat fiyat listesi PDF'ini analiz eden asistansın. Sana verilen ham metinden ürünleri çıkar. Her ürün için: name (ürün adı), category (Nalbur, Hırdavat, Elektrik, Sıhhi Tesisat, Boya, El Aletleri, Bahçe, Diğer kategorilerinden biri), basePrice (metindeki ham/liste fiyatı, sadece sayı) alanlarını bul. SADECE geçerli bir JSON dizisi döndür, başka hiçbir açıklama, yorum veya markdown işareti ekleme. Örnek çıktı: [{"name":"PPRC Dirsek 1/2","category":"Sıhhi Tesisat","basePrice":12.5}]`;
    const userMsg = `KDV oranı: %${kdv || 0}, iskonto: %${iskonto || 0}, kâr marjı: %${karMarji || 0}.\n\nListe metni:\n${text.slice(0, 15000)}`;
    const reply = await callClaude([{ role: "user", content: userMsg }], system, 4000);

    let products = [];
    try {
      const jsonMatch = reply.match(/\[[\s\S]*\]/);
      products = JSON.parse(jsonMatch ? jsonMatch[0] : reply);
    } catch (e) {
      throw new Error("Yapay zeka çıktısı okunamadı: " + reply.slice(0, 300));
    }

    const kdvMult = 1 + (Number(kdv) || 0) / 100;
    const karMult = 1 + (Number(karMarji) || 0) / 100;
    const iskMult = 1 - (Number(iskonto) || 0) / 100;
    products = products.map((p) => {
      const base = Number(p.basePrice) || 0;
      let final = base * kdvMult * karMult * iskMult;
      final = final < 100 ? Math.ceil(final) : Math.ceil(final / 10) * 10;
      return { name: p.name || "İsimsiz ürün", category: p.category || "Diğer", basePrice: base, finalPrice: final };
    });

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
