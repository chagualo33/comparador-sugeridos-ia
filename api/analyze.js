export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const rows = req.body.rows || [];

    const prompt = `
Analiza esta lista de productos y precios de proveedores.

Datos:
${JSON.stringify(rows)}

Genera:
1. Productos con mayor diferencia de precio
2. Qué proveedor es más competitivo
3. Recomendaciones de compra
`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await openaiResponse.json();

    if (!data.choices) {
      return res.status(500).json({
        error: "Error en OpenAI",
        details: data
      });
    }

    return res.status(200).json({
      analysis: data.choices[0].message.content
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }

}
