require("dotenv").config();
const express = require("express");
const cors = require("cors");
const systemPrompt = require("./systemPrompt");

const app = express();
app.use(cors());
app.use(express.json());

const conversationHistory = [];
const USE_OLLAMA = process.env.USE_OLLAMA === "true";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const STATION_IDS = ["KLR-01", "KLR-02", "KLR-03", "KLR-04", "GOM-01", "GOM-02", "PND-01", "PEL-01"];

async function fetchLiveData() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    try {
        // Fetch the last 50 rows — enough to find the latest reading per station
        const url = `${SUPABASE_URL}/rest/v1/sensor_readings?select=station_id,ph,tds,turbidity,do_mgl,quality_score,status,created_at&order=created_at.desc&limit=50`;
        const res = await fetch(url, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            }
        });
        if (!res.ok) return null;
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) return null;

        // Pick the most recent row per station
        const latest = {};
        for (const row of rows) {
            if (!latest[row.station_id]) latest[row.station_id] = row;
        }

        const ts = new Date().toUTCString();
        const lines = STATION_IDS.map(id => {
            const r = latest[id];
            if (!r) return `  ${id}: no data`;
            const ph  = r.ph        != null ? `pH ${Number(r.ph).toFixed(2)}`              : "pH —";
            const tds = r.tds       != null ? `TDS ${Number(r.tds).toFixed(0)} ppm`        : "TDS —";
            const tur = r.turbidity != null ? `Turb ${Number(r.turbidity).toFixed(2)} NTU` : "Turb —";
            const doV = r.do_mgl    != null ? `DO ${Number(r.do_mgl).toFixed(2)} mg/L`     : "DO —";
            const sc  = r.quality_score != null ? `Score ${r.quality_score}`               : "Score —";
            return `  ${id}: ${ph} | ${tds} | ${tur} | ${doV} | ${sc} | ${r.status}`;
        });

        return `[LIVE SENSOR DATA — ${ts}]\n${lines.join("\n")}\n[END LIVE DATA]`;
    } catch (err) {
        console.warn("Live data fetch failed:", err.message);
        return null;
    }
}

async function callAI(messages) {
    if (USE_OLLAMA) {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3.2",
                messages,
                stream: false,
                options: {
                    temperature: 0.4,
                    top_p: 0.85,
                    repeat_penalty: 1.3,
                    num_predict: 200,
                }
            })
        });
        const data = await response.json();
        if (!data.message) throw new Error("Ollama error: " + JSON.stringify(data));
        return data.message.content;

    } else {
        const models = [
            "meta-llama/llama-3.2-3b-instruct:free",
            "google/gemma-3-4b-it:free",
            "mistralai/mistral-7b-instruct:free",
            "qwen/qwen2.5-vl-3b-instruct:free",
            "microsoft/phi-4-reasoning-plus:free",
        ];

        let lastError = "";

        for (let attempt = 0; attempt < models.length; attempt++) {
            const model = models[attempt];
            try {
                console.log(`Trying model: ${model}`);
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.4,
                        max_tokens: 300
                    })
                });

                const data = await response.json();

                if (data.choices?.[0]?.message?.content) {
                    console.log(`Success with model: ${model}`);
                    return data.choices[0].message.content;
                }

                lastError = data.error?.message || "No content returned";
                console.log(`Model ${model} failed: ${lastError}`);

                if (data.error?.code === 429 || data.error?.code === 503) {
                    await new Promise(r => setTimeout(r, 1500));
                }

            } catch (err) {
                lastError = err.message;
                console.log(`Model ${model} threw error: ${lastError}`);
            }
        }

        throw new Error(`All models failed. Last error: ${lastError}`);
    }
}

app.post("/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    conversationHistory.push({ role: "user", content: message });

    try {
        // Fetch live sensor data and inject into context
        const liveData = await fetchLiveData();
        const systemWithLive = liveData
            ? `${systemPrompt}\n\n${liveData}\n\nUse the LIVE SENSOR DATA above when answering questions about current readings, status, or conditions. This data is real-time from the database — always prefer it over the typical profiles listed in the knowledge base.`
            : systemPrompt;

        const reply = await callAI([
            { role: "system", content: systemWithLive },
            ...conversationHistory
        ]);

        conversationHistory.push({ role: "assistant", content: reply });
        res.json({ reply });

    } catch (error) {
        console.error("AI error:", error.message);
        res.status(500).json({ error: "Something went wrong, please try again." });
    }
});

app.get("/", (req, res) => {
    res.json({ status: "FLO backend is running!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`FLO running on port ${PORT} — using ${USE_OLLAMA ? "Ollama (local)" : "OpenRouter (cloud)"}`);
});
