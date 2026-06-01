const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        reply_message: {
          type: SchemaType.STRING,
        },
        is_ready_to_order: {
          type: SchemaType.BOOLEAN,
        },
        order_details: {
          type: SchemaType.OBJECT,
          properties: {
            customer_name: { type: SchemaType.STRING },
            wilaya:        { type: SchemaType.STRING },
            phone:         { type: SchemaType.STRING },
            items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  product_id: { type: SchemaType.INTEGER },
                  quantity:   { type: SchemaType.INTEGER }
                }
              }
            }
          }
        }
      },
      required: ["reply_message", "is_ready_to_order"]
    }
  },
  systemInstruction: `أنت مساعد مبيعات جزائري محترف. تتكلم فقط بالدارجة الجزائرية.
هدفك هو مساعدة الزبائن وإتمام الطلبات.
عند تأكيد الطلب اطلب: الاسم، الولاية، رقم الهاتف.`
});

async function generateAIResponse(customerMessage, conversationHistory, catalog) {
  try {
    const catalogString = catalog.length > 0
      ? catalog.map(p => `ID: ${p.id} | ${p.name} | ${p.price} دج | المخزون: ${p.stock}`).join('\n')
      : "لا توجد منتجات متاحة حالياً.";

    const history = conversationHistory.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const model = getModel();
    const chat  = model.startChat({ history });

    const lastMessage = `
المنتجات المتاحة:
${catalogString}

رسالة الزبون: ${customerMessage}`;

    const result = await chat.sendMessage(lastMessage);
    const text   = result.response.text();
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      reply_message: "عذرا، كاين مشكل صغير. راني نولي ليك من بعد 🛠️",
      is_ready_to_order: false,
      order_details: null
    };
  }
}

module.exports = { generateAIResponse };