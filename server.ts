import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy client initialization for safety
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Prioritize Tasks API
app.post("/api/ai/prioritize", async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Invalid tasks list" });
    }

    if (tasks.length === 0) {
      return res.json({ prioritizedTasks: [], advice: "No tasks to prioritize. Add some deadlines!" });
    }

    const client = getGeminiClient();
    const prompt = `You are a high-stakes productivity specialist. Analyze the following list of tasks and deadlines.
Calculate a "priorityScore" from 0 to 100 for each task based on:
1. Urgency: How close is the deadline? Tasks with deadlines in hours/days need a higher score.
2. Importance: What is the category and estimated effort?
3. Threat/Impact: What happens if missed? (e.g. bills, exam assignments are high-impact).

Return a JSON array containing the original task objects, but with their 'priorityScore' (number 0-100) and 'priority' ('high' | 'medium' | 'low') fields updated.
Also provide a short 'advice' text summarizing how to handle this workload.

Tasks JSON:
${JSON.stringify(tasks, null, 2)}

Response MUST be exactly in JSON format matching this schema:
{
  "prioritizedTasks": [
    {
      "id": "task_id_here",
      "priorityScore": 85,
      "priority": "high"
    }
  ],
  "advice": "High-level summary advice for the user to manage their load."
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prioritizedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  priorityScore: { type: Type.INTEGER },
                  priority: { type: Type.STRING, description: "high, medium, or low" }
                },
                required: ["id", "priorityScore", "priority"]
              }
            },
            advice: { type: Type.STRING }
          },
          required: ["prioritizedTasks", "advice"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.warn("Prioritization Gemini call failed, using high-fidelity local fallback:", error.message || error);
    try {
      const { tasks } = req.body;
      const prioritizedTasks = (tasks || []).map((task: any) => {
        let score = 50;
        const msLeft = new Date(task.deadline).getTime() - Date.now();
        const hrsLeft = msLeft / (1000 * 60 * 60);

        if (hrsLeft <= 0) {
          score = 99;
        } else if (hrsLeft < 12) {
          score = 95;
        } else if (hrsLeft < 24) {
          score = 85;
        } else if (hrsLeft < 48) {
          score = 70;
        } else if (hrsLeft < 168) {
          score = 55;
        }

        if (task.category === "assignment") score += 10;
        else if (task.category === "bill") score += 15;
        else if (task.category === "meeting") score += 5;

        if (task.priority === "high") score += 15;
        else if (task.priority === "low") score -= 15;

        score = Math.max(10, Math.min(100, score));

        let calculatedPriority = "medium";
        if (score >= 75) calculatedPriority = "high";
        else if (score < 40) calculatedPriority = "low";

        return {
          id: task.id,
          priorityScore: Math.round(score),
          priority: calculatedPriority
        };
      });

      const advice = "We've activated the local Priority Scorer to secure your load. Focus primarily on high-score deadlines. Taking small, progressive actions is the ultimate cure for deadline anxiety.";
      res.json({ prioritizedTasks, advice });
    } catch (fallbackErr: any) {
      console.error("Fallback prioritization failed:", fallbackErr);
      res.status(500).json({ error: error.message || "Failed to prioritize tasks" });
    }
  }
});

// 2. Task Breakdown API
app.post("/api/ai/breakdown", async (req, res) => {
  const { task } = req.body;
  try {
    if (!task || !task.title) {
      return res.status(400).json({ error: "Invalid task data" });
    }

    const client = getGeminiClient();
    const prompt = `Break down this intimidating, complex task into 3 to 6 bite-sized, actionable subtasks that are easy to start and hard to procrastinate on.
Task: "${task.title}"
Description: "${task.description || 'No description provided'}"
Category: "${task.category}"
Time Left: "${task.deadline}"

Return a JSON array of subtasks, each with a 'title' and an 'estimatedMinutes' (suggested duration, integer).

Response format:
[
  { "title": "Bite-sized step", "estimatedMinutes": 15 }
]`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              estimatedMinutes: { type: Type.INTEGER }
            },
            required: ["title", "estimatedMinutes"]
          }
        }
      }
    });

    const resultText = response.text || "[]";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.warn("Breakdown Gemini call failed, using high-fidelity local fallback:", error.message || error);
    try {
      const cat = task.category || "other";
      let subtasks = [];
      if (cat === "assignment") {
        subtasks = [
          { title: "Review requirements & collect draft files", estimatedMinutes: 15 },
          { title: "Outline structural plan or key algorithm", estimatedMinutes: 30 },
          { title: "Implement core solution and primary draft", estimatedMinutes: 60 },
          { title: "Review guidelines, test details, and format", estimatedMinutes: 20 },
          { title: "Final submission check and deliver", estimatedMinutes: 15 }
        ];
      } else if (cat === "meeting") {
        subtasks = [
          { title: "Set clear objectives and prepare agenda", estimatedMinutes: 10 },
          { title: "Review brief history or relevant slides", estimatedMinutes: 15 },
          { title: "Test link, microphone, and shared screens", estimatedMinutes: 5 },
          { title: "Conduct meeting & record actionable points", estimatedMinutes: 45 }
        ];
      } else if (cat === "bill") {
        subtasks = [
          { title: "Open invoice statement & verify balance", estimatedMinutes: 5 },
          { title: "Verify transaction details and bank funds", estimatedMinutes: 5 },
          { title: "Complete transfer or process online payment", estimatedMinutes: 10 },
          { title: "Archive invoice receipt & log transaction", estimatedMinutes: 5 }
        ];
      } else if (cat === "commitment") {
        subtasks = [
          { title: "Review obligations & prepare resources", estimatedMinutes: 15 },
          { title: "Tackle primary action phase", estimatedMinutes: 45 },
          { title: "Refine deliverable & finalize details", estimatedMinutes: 20 },
          { title: "Notify stakeholders and complete log", estimatedMinutes: 10 }
        ];
      } else {
        subtasks = [
          { title: "Clarify ultimate success metric", estimatedMinutes: 10 },
          { title: "Begin first small micro-step", estimatedMinutes: 15 },
          { title: "Tackle core heavy-lifting phase", estimatedMinutes: 45 },
          { title: "Add finishing touches and verify work", estimatedMinutes: 20 }
        ];
      }
      res.json(subtasks);
    } catch (fallbackErr: any) {
      console.error("Fallback breakdown failed:", fallbackErr);
      res.status(500).json({ error: error.message || "Failed to break down task" });
    }
  }
});

// 3. Emergency Action Plan (EAP) Generator API
app.post("/api/ai/emergency-plan", async (req, res) => {
  const { title, deadline, description, category, currentLocalTime } = req.body;
  try {
    if (!title || !deadline) {
      return res.status(400).json({ error: "Task title and deadline are required" });
    }

    const client = getGeminiClient();
    const prompt = `You are the EMERGENCY SALVAGE OFFICER. The user has an extreme last-minute crisis:
Task: "${title}"
Description: "${description || 'No description'}"
Deadline: "${deadline}"
Current Time: "${currentLocalTime || new Date().toISOString()}"
Category: "${category}"

This is a critical situation where the user is at risk of missing this. Create a realistic, highly effective hour-by-hour action plan to salvage the situation and complete it.
Break the remaining time (or up to the next 8 hours) into logical steps, specifying exactly what to do, a practical focus tip, and duration in minutes. Ensure it accommodates rest/breather minutes.
The "timeSlot" field MUST be strictly formatted as "Hour 1", "Hour 2", "Hour 3", etc. Do NOT include any clock times, timestamps, dates, or time intervals like "(08:00 - 09:00)" or "(14:30 - 15:30)". Keep it strictly as "Hour X".
Also, list 3 powerful mental framing or survival tips for this high-stress period.

Return a JSON object matching this schema:
{
  "taskId": "emergency",
  "taskTitle": "${title.replace(/"/g, '\\"')}",
  "deadline": "${deadline}",
  "hoursRemaining": 12.5,
  "salvagePlanSteps": [
    {
      "timeSlot": "Hour 1",
      "action": "Immediate low-friction task to gain momentum.",
      "focusTip": "Close all tabs except the presentation document.",
      "durationMinutes": 45,
      "energyLevel": "high"
    }
  ],
  "generalTips": [
    "Survival tip 1",
    "Survival tip 2"
  ]
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskId: { type: Type.STRING },
            taskTitle: { type: Type.STRING },
            deadline: { type: Type.STRING },
            hoursRemaining: { type: Type.NUMBER },
            salvagePlanSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  action: { type: Type.STRING },
                  focusTip: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  energyLevel: { type: Type.STRING, description: "high, medium, or low" }
                },
                required: ["timeSlot", "action", "focusTip", "durationMinutes", "energyLevel"]
              }
            },
            generalTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["taskId", "taskTitle", "deadline", "hoursRemaining", "salvagePlanSteps", "generalTips"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.warn("Emergency Plan Gemini call failed, using high-fidelity local fallback:", error.message || error);
    try {
      const msLeft = new Date(deadline).getTime() - Date.now();
      let hrsLeft = Math.max(1, Math.round((msLeft / (1000 * 60 * 60)) * 10) / 10);
      if (isNaN(hrsLeft) || hrsLeft <= 0) hrsLeft = 4;

      const steps = [];
      const cat = category || "other";

      const totalStepsCount = Math.min(6, Math.max(3, Math.ceil(hrsLeft)));
      const stepDuration = Math.min(60, Math.round((hrsLeft * 60) / totalStepsCount));

      for (let i = 1; i <= totalStepsCount; i++) {
        let action = "";
        let focusTip = "";
        let energy = "medium";

        if (i === 1) {
          action = `Warmup: Clear clutter and prepare workspace for "${title}"`;
          focusTip = "Remove phone, block notifications, set timer for 25 minutes.";
          energy = "high";
        } else if (i === totalStepsCount) {
          action = "Final Review & Handover Submission";
          focusTip = "Review against basic requirements. Done is better than perfect.";
          energy = "low";
        } else if (i === 2) {
          action = `Deep Focus Phase: Tackle the highest friction core part of the ${cat}`;
          focusTip = "Put on focus music. Work strictly on one problem at a time.";
          energy = "high";
        } else if (i === 3 && totalStepsCount > 4) {
          action = "Execution & Incremental Buildout";
          focusTip = "Break into 15-minute intervals. Do not seek perfection.";
          energy = "high";
        } else {
          action = "Refinements, Formatting, and Formatting Correction";
          focusTip = "Stand up and stretch for 3 minutes before beginning.";
          energy = "medium";
        }

        steps.push({
          timeSlot: `Hour ${i}`,
          action,
          focusTip,
          durationMinutes: stepDuration || 45,
          energyLevel: energy
        });
      }

      const generalTips = [
        "Strive for completion over perfection. An 80% submission gets a grade; a 0% submission does not.",
        "Activate the 5-Minute Rule: Tell yourself you will work for just 5 minutes. Action triggers motivation.",
        "Hydrate and walk around for 2 minutes every hour. Physical movement resets cognitive fatigue."
      ];

      res.json({
        taskId: "emergency",
        taskTitle: title,
        deadline,
        hoursRemaining: hrsLeft,
        salvagePlanSteps: steps,
        generalTips
      });
    } catch (fallbackErr: any) {
      console.error("Fallback emergency-plan failed:", fallbackErr);
      res.status(500).json({ error: error.message || "Failed to generate emergency plan" });
    }
  }
});

// 4. Voice Command / NLP Parser API
app.post("/api/ai/voice-command", async (req, res) => {
  const { transcript, currentLocalTime } = req.body;
  try {
    if (!transcript) {
      return res.status(400).json({ error: "No voice or text command transcript provided" });
    }

    const client = getGeminiClient();
    const prompt = `You are the NLP controller for 'The Last-Minute Life Saver' app.
The user spoke or typed this command: "${transcript}"
Current Local Time is: ${currentLocalTime || new Date().toISOString()}

Analyze the intent and parse it into an action command structure.
Supported action types:
1. CREATE_TASK: Add a new deadline. Extract title, category (assignment, meeting, bill, commitment, other), deadline (convert relative dates like "tomorrow at 5pm", "next Monday morning" into valid ISO string), estimatedHours.
2. COMPLETE_TASK: Mark a task completed. Extract potential title match.
3. GENERATE_PLAN: Create an emergency plan for a task. Extract title or keyword.
4. TALK: General greeting, motivation, advice, or query about their schedule.

Your response must be JSON matching this schema:
{
  "action": "CREATE_TASK" | "COMPLETE_TASK" | "GENERATE_PLAN" | "TALK",
  "extractedData": {
    "title": "Title of task if found",
    "category": "assignment" | "meeting" | "bill" | "commitment" | "other",
    "deadline": "ISO_DATETIME_STRING_OR_EMPTY",
    "estimatedHours": 1.5
  },
  "feedbackMessage": "Friendly verbal confirmation from the AI (e.g. 'Got it! I added Assignment 3 due tomorrow at 5:00 PM to your dashboard.')"
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "CREATE_TASK, COMPLETE_TASK, GENERATE_PLAN, or TALK" },
            extractedData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                deadline: { type: Type.STRING },
                estimatedHours: { type: Type.NUMBER }
              }
            },
            feedbackMessage: { type: Type.STRING }
          },
          required: ["action", "feedbackMessage"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.warn("Voice Command Gemini call failed, using high-fidelity local fallback:", error.message || error);
    try {
      const text = (transcript || "").toLowerCase();
      let action = "TALK";
      let title = "";
      let category = "assignment";
      let deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      let estimatedHours = 2;
      let feedbackMessage = "I processed your voice command. Let me know how else I can support you.";

      if (text.includes("add") || text.includes("create") || text.includes("new")) {
        action = "CREATE_TASK";
        const match = transcript.match(/(?:add|create|new)\s+(?:task|assignment|meeting|bill)?\s*(.*?)(?:\s+due|\s+by|\s+at|$)/i);
        title = match && match[1] ? match[1].trim() : "New Salvage Task";
        if (text.includes("meeting") || text.includes("call")) category = "meeting";
        else if (text.includes("bill") || text.includes("pay")) category = "bill";
        else if (text.includes("commitment") || text.includes("event")) category = "commitment";
        
        feedbackMessage = `Got it! I added "${title}" (Category: ${category}) due tomorrow to your salvage dashboard.`;
      } else if (text.includes("complete") || text.includes("done") || text.includes("finish")) {
        action = "COMPLETE_TASK";
        const match = transcript.match(/(?:complete|done|finish)\s+(.*)/i);
        title = match && match[1] ? match[1].trim() : "";
        feedbackMessage = `Excellent work! Marking "${title || "task"}" as completed. Victory secured!`;
      } else if (text.includes("plan") || text.includes("salvage") || text.includes("rescue")) {
        action = "GENERATE_PLAN";
        const match = transcript.match(/(?:plan|salvage|rescue)\s+(.*)/i);
        title = match && match[1] ? match[1].trim() : "";
        feedbackMessage = `Opening the Salvage Control Center. Let's build a rescue plan to secure your deadline!`;
      } else {
        feedbackMessage = "The Salvage Officer is standing by. Tell me to 'add task', 'complete task', or 'generate plan' to command the response.";
      }

      res.json({
        action,
        extractedData: { title, category, deadline, estimatedHours },
        feedbackMessage
      });
    } catch (fallbackErr: any) {
      console.error("Fallback voice command failed:", fallbackErr);
      res.status(500).json({ error: error.message || "Failed to process voice command" });
    }
  }
});

// 5. Smart Recommendations API
app.post("/api/ai/recommendations", async (req, res) => {
  try {
    const { tasks, habits } = req.body;
    const client = getGeminiClient();

    const prompt = `You are a warm, witty productivity strategist who saves procrastinating students and busy founders.
Analyze their active tasks and habits:
Tasks: ${JSON.stringify(tasks || [])}
Habits: ${JSON.stringify(habits || [])}

Provide exactly 3 custom, actionable recommendations to avoid burnout, stop procrastinating on their highest-stress task, or integrate habits.
Each recommendation should have a specific title, concise content, and a type ('anti-procrastination' | 'scheduling' | 'wellness' | 'focus').

Return JSON matching this schema:
{
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Clear visual recommendation title",
      "content": "Specific action the user can do right now in 2 minutes.",
      "type": "anti-procrastination"
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["id", "title", "content", "type"]
              }
            }
          },
          required: ["recommendations"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.warn("Recommendations Gemini call failed, using high-fidelity local fallback:", error.message || error);
    try {
      const recommendations = [
        {
          id: "rec_1",
          title: "The 5-Minute Rule",
          content: "Pick your most intimidating task and work on it for exactly 5 minutes with a timer. Starting breaks the friction.",
          type: "anti-procrastination"
        },
        {
          id: "rec_2",
          title: "Micro-Break Reset",
          content: "Stand up, stretch your arms, and take three deep breaths. Physical reset directly lowers cortisol and stress.",
          type: "wellness"
        },
        {
          id: "rec_3",
          title: "Isolate One Variable",
          content: "Close all browser tabs except the exact assignment or resource page. Eliminate peripheral noise instantly.",
          type: "focus"
        }
      ];
      res.json({ recommendations });
    } catch (fallbackErr: any) {
      console.error("Fallback recommendations failed:", fallbackErr);
      res.status(500).json({ error: error.message || "Failed to get recommendations" });
    }
  }
});


// Serve static files / Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
