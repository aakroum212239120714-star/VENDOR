const Groq = require("groq-sdk");
require("dotenv").config();

// تهيئة عميل Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateAIResponse(customerMessage, conversationHistory, catalog) {
  try {
    // 1. تحضير قائمة المنتجات
    const catalogString = catalog.length > 0
      ? catalog.map(p => `ID: ${p.id} | ${p.name} | ${p.price} دج | المخزون: ${p.stock}`).join('\n')
      : "لا توجد منتجات متاحة حالياً.";

    // 2. تأمين السجل والتأكد أنه Array
    const safeHistory = Array.isArray(conversationHistory) ? conversationHistory : [];

    // 3. تحويل السجل لصيغة Groq (استخدام assistant بدلاً من model)
    // وضعنا fallback احتياطي في حال كان السجل القديم بصيغة جيميناي
    const messages = safeHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content || (msg.parts && msg.parts[0] ? msg.parts[0].text : "")
    }));

    // 4. إعداد تعليمة النظام (System Prompt) التي تعوض SchemaType
    const systemInstruction = `أنت مساعد مبيعات جزائري محترف. تتكلم فقط بالدارجة الجزائرية.
هدفك هو مساعدة الزبائن وإتمام الطلبات.
عند تأكيد الطلب اطلب: الاسم، الولاية، رقم الهاتف.

المنتجات المتاحة حالياً:
${catalogString}

يجب أن يكون ردك دائماً بصيغة JSON حصراً، ويحتوي على المفاتيح التالية بدقة:
{
  "reply_message": "نص الرد الذي سيظهر للزبون بالدارجة",
  "is_ready_to_order": true أو false,
  "order_details": {
    "customer_name": "اسم الزبون هنا",
    "wilaya": "الولاية هنا",
    "phone": "رقم الهاتف هنا",
    "items": [
      {
        "product_id": رقم المنتج,
        "quantity": الكمية المطلوبة
      }
    ]
  }
}
ملاحظة: إذا كان is_ready_to_order يساوي false (الزبون يستفسر فقط ولم يقدم معلوماته بعد)، اجعل order_details تساوي null.`;

    // 5. إدراج تعليمة النظام في بداية المحادثة
    messages.unshift({ role: "system", content: systemInstruction });

    // 6. إضافة رسالة الزبون الجديدة
    messages.push({ role: "user", content: customerMessage });

    // 7. إرسال الطلب إلى Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "openai/gpt-oss-120b", // موديل قوي وسريع جداً ويتعامل مع JSON بامتياز
      temperature: 0.5,
      response_format: { type: "json_object" } // إجبار الموديل على إرجاع كائن JSON
    });

    // 8. استخراج النص وتحويله إلى كائن JavaScript
    const text = chatCompletion.choices[0]?.message?.content;
    return JSON.parse(text);

  } catch (error) {
    console.error("❌ Groq Error:", error);
    // إرجاع رد افتراضي يحمي الخادم من التوقف
    return {
      reply_message: "عذرا، كاين ضغط على النظام حاليا. راني نولي ليك من بعد شوية 🛠️",
      is_ready_to_order: false,
      order_details: null
    };
  }
}

module.exports = { generateAIResponse };