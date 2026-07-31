import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Wajib untuk React/Vite
});

export async function askPetBitesAI(userMessage: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Sangat kencang dan hemat
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten AI dari PetBites yang ahli, ramah, dan solutif dalam membantu pengguna seputar makanan dan kesehatan hewan peliharaan.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error OpenAI:", error);
    throw new Error("Gagal mendapatkan respon dari AI.");
  }
}
