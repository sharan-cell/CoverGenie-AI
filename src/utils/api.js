export async function generateCoverLetter(profile, jd, company, tone = "Professional") {
  const prompt = `
Write a ${tone.toLowerCase()}, tailored cover letter under 200 words for a job application.

Candidate:
- Name: ${profile.name}
- Role: ${profile.role}
- Skills: ${profile.skills}
- Experience: ${profile.experience}
- Email: ${profile.email || "Not provided"}
- Phone: ${profile.phone || "Not provided"}

Company: ${company || "Not specified"}
Job Description: ${jd}

Avoid any placeholders like [Insert Info]. Write a complete, finished letter ready to send.
`;


  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://your-site.com"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Something went wrong.";
}
