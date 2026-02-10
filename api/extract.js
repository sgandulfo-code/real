body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Analiza el siguiente contenido de una web inmobiliaria. 
          
          TU OBJETIVO:
          1. Encuentra el PRECIO DE VENTA. Busca números acompañados de "USD", "U$S", "$" o la palabra "Venta". 
          2. Si ves varios precios, elige el más alto (suele ser el de venta) y no el de expensas.
          3. Extrae la dirección exacta y el nombre de la inmobiliaria.
          4. Si encuentras coordenadas (lat, lng) en el texto, úsalas. Si no, pon 0.

          REGLA DE ORO: No inventes precios que no existan en el texto. Si encuentras un número que parece el precio, úsalo.

          CONTENIDO:
          ${cleanText.substring(0, 12000)}

          RESPONDE SOLO JSON:
          {"title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0}`
        }]
      }]
    })
