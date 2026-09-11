const { callClaude } = require("../lib/anthropic");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { query, stock, history } = req.body || {};
    if (!query || !query.trim()) {
      res.status(400).json({ error: "query gerekli" });
      return;
    }
    const system = `Sen bir nalbur/hırdavat dükkanının fiyat bulma asistanısın. Sana verilen stok listesinde (JSON) kullanıcının tarif ettiği ürünü bul. Ürün tipini (örn. PPRC dirsek) ve varsa ölçüsünü (örn. 1/2) dikkate al. Eğer ölçü/tip/marka belirsizse ve stokta birden fazla olası eşleşme varsa KISA bir netleştirme sorusu sor. Eminsen ürünü ve fiyatını net şekilde söyle. Stokta hiç bulamazsan bunu açıkça söyle.\n\nStok: ${JSON.stringify(stock || []).slice(0, 6000)}`;
    const messages = [...(history || []), { role: "user", content: query }];
    const reply = await callClaude(messages, system, 600);
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
};
