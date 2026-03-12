export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {

    const rows = req.body.rows || [];

    const prompt = `
Analiza esta tabla de productos y precios de proveedores.

Datos:
${JSON.stringify(rows)}

Devuelve:
1. Diferencias relevantes de precio
2. Productos donde SAG sea más competitivo
3. Productos donde FOCUSS sea más competitivo
4. Recomendaciones de compra
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      analysis: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }

}
