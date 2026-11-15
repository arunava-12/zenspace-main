import express from "express";
import Groq from "groq-sdk";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";

// ---------------------------------------------------------------------------
// Robust JSON extraction: handles fences, leading prose, trailing prose,
// and attempts a best-effort repair on truncated arrays.
// ---------------------------------------------------------------------------
function extractJSON(raw: string): any[] {
  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  let text = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/```[\s\S]*$/im, "")
    .trim();

  // 2. Find the first '[' and last ']' — ignore any surrounding prose
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1) {
    throw new Error(`No JSON array found in response. Raw: ${raw.slice(0, 200)}`);
  }

  // 3. If we found both brackets, slice to them
  let jsonStr =
    end !== -1 && end > start ? text.slice(start, end + 1) : text.slice(start);

  // 4. Attempt direct parse first
  try {
    return JSON.parse(jsonStr);
  } catch (_) {
    // 5. Truncation repair: if the array was cut off, try to close it gracefully
    //    Find the last complete object (ends with '}') and close the array.
    const lastBrace = jsonStr.lastIndexOf("}");
    if (lastBrace !== -1) {
      const repaired = jsonStr.slice(0, lastBrace + 1) + "]";
      try {
        return JSON.parse(repaired);
      } catch (_2) {
        // fall through to final error
      }
    }
    throw new Error(
      `JSON parse failed. Cleaned string: ${jsonStr.slice(0, 300)}`
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/ai/chat
// ---------------------------------------------------------------------------
router.post("/chat", async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: req.body.prompt }],
    });
    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    console.error("AI /chat error:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ai/suggest-tasks
// ---------------------------------------------------------------------------
router.post("/suggest-tasks", async (req, res) => {
  try {
    const { name, description } = req.body ?? {};

    // A project description is optional in the database; the project name is
    // sufficient context for generating useful starter tasks.
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ error: "description must be a string" });
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      // max_tokens keeps the response tight and prevents mid-array truncation
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content:
            "You are a JSON API. You only output valid raw JSON arrays. " +
            "Never include markdown, code fences, explanations, or any text outside the JSON array.",
        },
        {
          role: "user",
          content:
            `Generate exactly 3 specific actionable tasks for a project named "${name.trim()}" ` +
            `with description "${(description || "No project description provided").trim()}". ` +
            `Return ONLY a JSON array of 3 objects. ` +
            `Each object must have exactly these keys: ` +
            `"title" (string), "description" (string), "priority" ("low"|"medium"|"high"), "type" (string). ` +
            `Example: [{"title":"Set up CI/CD","description":"Configure GitHub Actions pipeline","priority":"high","type":"feature"}]`,
        },
      ],
    });

    const raw = completion.choices[0].message.content ?? "";
    console.log("AI /suggest-tasks raw response:", raw); // keep for debugging

    const parsed = extractJSON(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("AI response must be a JSON array");
    }

    const normalized = parsed
      .filter((task: any) => task && typeof task.title === "string" && task.title.trim())
      .slice(0, 3)
      .map((task: any) => {
        const priority = String(task.priority || "Medium").toLowerCase();
        const type = String(task.type || "TASK").toUpperCase();
        return {
          title: task.title.trim(),
          description: typeof task.description === "string" ? task.description : "",
          priority: priority === "high" ? "High" : priority === "low" ? "Low" : "Medium",
          type: ["TASK", "BUG", "FEATURE", "IMPROVEMENT"].includes(type) ? type : "TASK",
        };
      });

    if (normalized.length === 0) {
      return res.status(502).json({ error: "AI returned no usable task suggestions" });
    }

    res.json(normalized);
  } catch (err) {
    console.error("AI /suggest-tasks error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;