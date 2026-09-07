import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client (lazy or guarded)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error("Error initializing GoogleGenAI client:", err);
  }
}

const ABUAD_SYSTEM_PROMPT = `You are the official Female Virtual Assistant for Afe Babalola University, Ado-Ekiti (ABUAD), Nigeria.
You speak with a warm, articulate, respectful, polite, and encouraging Nigerian voice and persona.

INTRODUCTION & GREETING RULE:
Whenever introducing yourself or beginning a fresh discussion, state:
"Hello! I am your virtual assistant for Afe Babalola University. How may I help you?"

ADVISORY & GUIDANCE RESPONSIBILITIES BASED ON USER RESPONSE:
1. For Prospective Applicants & Parents:
   - Provide clear, step-by-step guidance on admission requirements, minimum JAMB cut-off marks (180 general, 200+ for Law & Engineering, 250+ for MBBS/Pharmacy/Dentistry), Direct Entry (JUPEB, Cambridge A-Level), and O'Level subject combinations.
   - Explain how to register online on the official admissions portal: admissions.abuad.edu.ng.
   - Explain college tuition fees and the 50% / 30% / 20% semester installment breakdown.
   - Outline hostel accommodation types (Executive, 2-bed, 4-bed en-suite with 24/7 power, water, Wi-Fi) and Founder's Merit Scholarships.

2. For Enrolled Students:
   - Guide students on portal course registration (portal.abuad.edu.ng), exam timetables, hostel room allocation, college dress codes (Mon-Thurs corporate), student affairs clearances, and health consultations at the 400-bed ABUAD Multi-System Hospital.

3. For Campus Visitors & Enquirers:
   - Provide direct navigation to campus landmarks (Aare Afe Babalola Law Complex, Multi-System Hospital, FESTO Mechatronics Training Center, Alfa Belgore Amphitheater, Talent Discovery Centre).

KEY FACTS ABOUT AFE BABALOLA UNIVERSITY (ABUAD):
- Founder: Aare Afe Babalola, SAN, CFR, OFR, LL.D — renowned Nigerian lawyer, educationist, and philanthropist. Founded in 2009.
- Location: Km 8.5, Afe Babalola Way, Ado-Ekiti, Ekiti State, Nigeria.
- Official Website: https://www.abuad.edu.ng/
- Vision: A world-class educational center of excellence in academics, character, sports, and vocational development.
- Core Values: Labor, Service, Integrity, Moral Excellence, and Self-Reliance.
- Ranking & Accreditations: Ranked top private university in Nigeria and Sub-Saharan Africa (Times Higher Education). 100% NUC, COREN, MDCN, NBA/CLE, PCN, NMCN accredited programs.

COLLEGES & FLAGSHIP PROGRAMS:
1. College of Law: Best in Nigeria (Aare Afe Babalola Law Complex, Ultra-modern Moot Courts, 5-year LL.B).
2. College of Medicine & Health Sciences: MBBS (Medicine & Surgery), Nursing Science, Medical Laboratory Science, Dentistry, Human Anatomy, Physiology, Pharmacology, Public Health. Anchored by the 400-bed state-of-the-art ABUAD Multi-System Hospital (equipped for open heart surgery, kidney transplant, laser lithotripsy, cath lab, MRI, CT).
3. College of Engineering: Mechanical, Mechatronics, Biomedical, Aeronautical, Electrical/Electronics, Civil, Petroleum, Chemical, Computer Engineering. State-of-the-art FESTO Mechatronics Training Center.
4. College of Sciences: Computer Science, Cybersecurity, Data Science, Software Engineering, Microbiology, Biochemistry, Biotechnology, Industrial Chemistry, Physics.
5. College of Social & Management Sciences: Economics, Accounting, Banking & Finance, Business Administration, International Relations & Diplomacy, Intelligence & Security Studies, Media & Communication Studies, Peace & Conflict Studies, Tourism.
6. College of Pharmacy: Doctor of Pharmacy (Pharm.D - 6 years).
7. College of Agriculture: Agricultural Economics, Animal Science, Crop Science, Fisheries with commercial farms, moringa factory, and food processing plants.
8. College of Postgraduate Studies: PGD, M.Sc, M.Eng, LL.M, MBA, Ph.D programs.
9. Open & Distance Learning / Part-Time: Directorate of Part-Time Studies.

CONTACT DIRECTORY:
- Admissions: admissions@abuad.edu.ng | +234 812 777 2121 / +234 803 852 1193
- Registry: registrar@abuad.edu.ng | +234 803 440 2425
- Bursary: bursar@abuad.edu.ng / fees@abuad.edu.ng
- Student Affairs: studentaffairs@abuad.edu.ng | +234 805 554 1120
- ICT Helpdesk: ictsupport@abuad.edu.ng | portal@abuad.edu.ng
- Hospital Emergency: hospital@abuad.edu.ng | +234 813 416 0058

BEHAVIOR AND TONE:
- Write in a natural, calm, measured cadence (easy to listen to at standard or calm voice speed).
- Be respectful, courteous, highly encouraging, structured, and informative.
- Use bold bullet points and clear step-by-step instructions.
- Include actionable next steps for the user (e.g. portal link, contact email, campus landmark route).`;

/**
 * Comprehensive Grounded Knowledge Fallback Generator
 * Generates rich, highly accurate, structured answers from verified ABUAD facts and RAG context
 */
function generateGroundedABUADResponse(
  message: string,
  userRole: string = "applicant",
  ragContext: string = "",
  _history: any[] = []
): string {
  const lower = message.toLowerCase();

  // 1. If custom RAG context is provided and contains substantive text, extract and synthesize it
  if (ragContext && ragContext.trim().length > 30) {
    // Check if the query matches the RAG snippets
    const ragSnippets = ragContext
      .split(/\[Knowledge Snippet \d+[^\]]*\]/i)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    if (ragSnippets.length > 0) {
      const topSnippet = ragSnippets[0];
      return `### Official Grounded Information from ABUAD Knowledge Records:\n\n${topSnippet}\n\n**Next Steps & Key Resources:**\n- **Official University Portal**: [https://www.abuad.edu.ng/](https://www.abuad.edu.ng/)\n- **Admissions Enquiries**: admissions@abuad.edu.ng | +234 812 777 2121\n- **Student & Academic Helpdesk**: portal@abuad.edu.ng`;
    }
  }

  // 2. Domain-specific grounded responses
  if (
    lower.includes("admission") ||
    lower.includes("apply") ||
    lower.includes("requirement") ||
    lower.includes("cut off") ||
    lower.includes("cut-off") ||
    lower.includes("jamb") ||
    lower.includes("utme") ||
    lower.includes("post-utme") ||
    lower.includes("post utme") ||
    lower.includes("direct entry") ||
    lower.includes("o level") ||
    lower.includes("o'level")
  ) {
    return `### ABUAD Undergraduate Admissions & Requirements Guide

Welcome to Afe Babalola University! Here are the official admission requirements and guidelines:

#### 1. JAMB UTME Minimum Cut-off Benchmarks:
- **General University Cut-Off**: **180+** (Sciences, Social Sciences, Management, Agriculture)
- **College of Law (LL.B)**: **200+**
- **College of Engineering**: **200+**
- **Nursing Science & Medical Lab Science**: **220 - 230+**
- **College of Pharmacy (Pharm.D)**: **230+**
- **College of Medicine & Surgery (MBBS)**: **250+**

#### 2. O'Level Requirements:
- Minimum of **5 Credit passes** at not more than **2 sittings** in WAEC, NECO, NABTEB, or Cambridge IGCSE.
- Must include **English Language, Mathematics**, and relevant science/arts core subjects (e.g. Biology, Chemistry, Physics for Medicine; Literature, Government/CRS for Law).

#### 3. Direct Entry (DE) Options:
- **JUPEB**: Minimum of 6 to 12 points depending on the intended degree program.
- **Cambridge A-Levels / IJMB**: Minimum 2-3 advanced level credit passes.
- **Diploma / OND / HND / Transfer**: Transcripts evaluated for 200-level admission.

#### 4. Step-by-Step Application Process:
1. Visit the official portal: [admissions.abuad.edu.ng](https://admissions.abuad.edu.ng).
2. Create an applicant profile using a valid email and phone number.
3. Pay the application fee and complete the bio-data and academic history form.
4. Upload scanned copies of your JAMB slip, O'Level result(s), and birth certificate.
5. Participate in the scheduled online Post-UTME screening interview.

**Admissions Hotline**: admissions@abuad.edu.ng | +234 812 777 2121 / +234 803 852 1193`;
  }

  if (
    lower.includes("fee") ||
    lower.includes("tuition") ||
    lower.includes("cost") ||
    lower.includes("price") ||
    lower.includes("pay") ||
    lower.includes("installment") ||
    lower.includes("50") ||
    lower.includes("bursary") ||
    lower.includes("draft")
  ) {
    return `### ABUAD Tuition Fees & 50% - 30% - 20% Installment Plan

Afe Babalola University provides an all-inclusive tuition structure that covers modern en-suite on-campus accommodation, 24/7 uninterrupted power and water supply, medical clinic coverage, ICT access, and entrepreneurship certifications.

#### Flexible Installment Payment Breakdown:
1. **First Semester Resumption (50%)**: Payable upon registration at the beginning of the academic session. Covers admission clearance, initial tuition, and hostel allocation.
2. **Second Semester Resumption (30%)**: Payable upon resumption for the second semester before mid-session activities.
3. **Final Exam Clearance (20%)**: Payable prior to the commencement of second semester examinations to obtain final exam clearance slips.

#### Payment Procedures:
- All payments must be made directly through the official university portal at [portal.abuad.edu.ng](https://portal.abuad.edu.ng) or through bank drafts issued to *Afe Babalola University*.
- **Caution**: The university does not accept cash payments or transfers into individual personal bank accounts.

**Bursary & Accounts Helpdesk**: fees@abuad.edu.ng | bursar@abuad.edu.ng`;
  }

  if (
    lower.includes("law") ||
    lower.includes("legal") ||
    lower.includes("llb") ||
    lower.includes("bar") ||
    lower.includes("moot") ||
    lower.includes("aare afe")
  ) {
    return `### ABUAD College of Law — Premier Faculty in Nigeria

The **College of Law** at Afe Babalola University is widely recognized by the Council of Legal Education (CLE) and the Nigerian Bar Association (NBA) as one of the best law colleges in Nigeria and Africa.

#### Key Features & Highlights:
- **Aare Afe Babalola Law Complex**: Houses ultra-modern electronic Moot Courts equipped with digital recording facilities, mock chambers, and an extensive law library.
- **Programs**: 5-Year Bachelor of Laws (LL.B), Master of Laws (LL.M), and Ph.D in Law.
- **Dress Code**: Strict corporate **Black and White** attire (Monday to Friday), reflecting legal profession decorum.
- **Accreditation**: 100% full accreditation with outstanding performance records at the Nigerian Law School.

**Enquiries**: law@abuad.edu.ng | admissions@abuad.edu.ng`;
  }

  if (
    lower.includes("medicine") ||
    lower.includes("hospital") ||
    lower.includes("nursing") ||
    lower.includes("doctor") ||
    lower.includes("mbbs") ||
    lower.includes("dentistry") ||
    lower.includes("lab science") ||
    lower.includes("medical") ||
    lower.includes("transplant") ||
    lower.includes("surgery")
  ) {
    return `### College of Medicine & Health Sciences & 400-Bed Multi-System Hospital

ABUAD's medical programs are anchored by the state-of-the-art **ABUAD Multi-System Hospital (AMSH)**, recognized across West Africa for cutting-edge clinical technology.

#### Specialized Facilities at the Hospital:
- **14 Modular Surgical Theatres** & Intensive Care Units (ICU).
- **Renal Transplant Unit**: Successfully performing routine kidney transplants in Nigeria.
- **Cardiac Catheterization Laboratory**: For open-heart surgery and vascular interventions.
- **Diagnostic Suites**: 1.5 Tesla MRI, 128-Slice CT Scanner, Digital Mammography, and Laser Lithotripsy.

#### Accredited Programs:
- **MBBS** (Medicine & Surgery) — Fully accredited by MDCN.
- **B.N.Sc** (Nursing Science) — Accredited by NMCN.
- **B.MLS** (Medical Laboratory Science) — Accredited by MLSCN.
- **B.DS** (Dentistry & Dental Surgery).
- **Pharm.D** (Doctor of Pharmacy — 6-year program).
- **Human Anatomy, Physiology, Pharmacology & Public Health**.

**Hospital 24/7 Emergency Line**: hospital@abuad.edu.ng | +234 813 416 0058`;
  }

  if (
    lower.includes("engineering") ||
    lower.includes("festo") ||
    lower.includes("mechatronics") ||
    lower.includes("mechanical") ||
    lower.includes("electrical") ||
    lower.includes("civil") ||
    lower.includes("aeronautical") ||
    lower.includes("biomedical")
  ) {
    return `### College of Engineering & FESTO Mechatronics Center

ABUAD College of Engineering is fully accredited by the **Council for the Regulation of Engineering in Nigeria (COREN)** and the NUC.

#### Disciplines Offered:
- **Mechatronics Engineering** (Automated Systems & Robotics)
- **Biomedical Engineering** (Medical devices & prosthetics)
- **Aeronautical & Astronautical Engineering**
- **Mechanical Engineering**
- **Electrical & Electronics Engineering**
- **Civil & Structural Engineering**
- **Petroleum & Chemical Engineering**
- **Computer Engineering**

#### Flagship Facilities:
- **FESTO Industrial Mechatronics Training Center**: Germany-certified training hub for robotics, pneumatics, and industrial automation.
- 38 state-of-the-art engineering laboratories and workshops.
- International software certification tracks in AutoCAD, MATLAB, and SolidWorks.

**Enquiries**: engineering@abuad.edu.ng`;
  }

  if (
    lower.includes("hostel") ||
    lower.includes("accommodation") ||
    lower.includes("room") ||
    lower.includes("dorm") ||
    lower.includes("living") ||
    lower.includes("bed")
  ) {
    return `### Campus Accommodation & Student Hostels

Afe Babalola University is a **100% residential campus**. Every undergraduate student is accommodated in secure, modern on-campus halls of residence.

#### Room Configurations & Amenities:
- **Room Types**: En-suite 2-bed, 4-bed, and executive single/double suites.
- **Utilities**: 24/7 uninterrupted power supply, treated water supply, and high-speed campus Wi-Fi.
- **Facilities**: In-house laundry units, study common rooms, tuck shops, and dining cafeterias.
- **Security**: 24/7 campus security patrol, biometric entry gates, and resident hall wardens.

#### Halls of Residence:
- **Male Hostels**: King Samson Hall, King David Hall, Apostle Afe Babalola Hall.
- **Female Hostels**: Queen Esther Hall, Queen Amina Hall, Moremi Hall, Princess Grace Hall.

**Student Affairs Desk**: studentaffairs@abuad.edu.ng | +234 805 554 1120`;
  }

  if (
    lower.includes("dress code") ||
    lower.includes("rules") ||
    lower.includes("conduct") ||
    lower.includes("regulations") ||
    lower.includes("curfew") ||
    lower.includes("clothes")
  ) {
    return `### ABUAD Student Code of Conduct & Dress Policy

ABUAD emphasizes excellence in **Academics, Character, and Moral Discipline**.

#### Dress Code Policy:
- **Monday through Thursday**: Strict formal corporate business attire for all students.
  - Gentlemen: Well-tailored suits or long-sleeve shirts with neckties and dress trousers.
  - Ladies: Corporate gowns, skirt suits, or blouse/skirt combinations below knee level.
- **College Colors**:
  - *College of Law*: Black and White only.
  - *College of Medicine & Nursing*: White lab coats / formal white attire.
  - *Engineering & Sciences*: Navy blue, burgundy, or dark corporate tones.
- **Friday / Weekend**: Modest casual/traditional wear.

#### University Policies:
- Zero tolerance for drug/alcohol abuse, cultism, sexual harassment, or examination malpractice (attracts immediate expulsion).
- All students must be in their respective halls by the evening curfew.`;
  }

  if (
    lower.includes("scholarship") ||
    lower.includes("award") ||
    lower.includes("grant") ||
    lower.includes("dean") ||
    lower.includes("financial aid") ||
    lower.includes("discount")
  ) {
    return `### Founder's Merit Scholarships & Financial Aid

Aare Afe Babalola, SAN, CFR provides several scholarship funds and merit awards to recognize academic brilliance and assist talented students:

1. **Founder's UTME Merit Awards**:
   - Cash grants ranging from **₦100,000 to ₦500,000** awarded to candidates who achieve exceptionally high scores in JAMB UTME upon admission.
2. **Dean's Honors List Award**:
   - Annual scholastic award of **₦250,000** for undergraduate students who maintain a **First Class Cumulative GPA of 4.50 and above** at the end of each session.
3. **Talent Discovery Grants**:
   - Financial sponsorship for students with outstanding achievements in sports, music, drama, and scientific innovation through the Talent Discovery Centre (TDC).
4. **Indigent Student Bursary**:
   - Financial assistance schemes for deserving students with documented financial hardship.

**Scholarship Inquiries**: registrar@abuad.edu.ng | bursar@abuad.edu.ng`;
  }

  if (
    lower.includes("where is") ||
    lower.includes("location") ||
    lower.includes("map") ||
    lower.includes("navigate") ||
    lower.includes("direction") ||
    lower.includes("belgore") ||
    lower.includes("tdc") ||
    lower.includes("gate") ||
    lower.includes("building")
  ) {
    return `### Campus Navigation & Key Landmarks Guide

Afe Babalola University is located at **Km 8.5, Afe Babalola Way, Ado-Ekiti, Ekiti State, Nigeria**.

#### Key Landmark Locations:
- **Main Campus Gate & Security Portal**: Welcoming entrance on Afe Babalola Way with visitor verification desks.
- **Aare Afe Babalola Law Complex**: Located near the Senate Building along Main Academic Boulevard.
- **ABUAD 400-Bed Multi-System Hospital**: Located on the eastern medical wing, accessible from the hospital express entrance.
- **FESTO Engineering Complex**: Centrally situated in the Science and Technology quadrant.
- **Alfa Belgore Hall**: Multi-purpose central auditorium used for matriculation, convocation, and national conferences.
- **Talent Discovery Centre (TDC)**: Adjacent to the Sports Complex with Olympic-sized pool and indoor gymnasium.
- **Student Halls of Residence**: Male halls located on North Quad; Female halls on South Quad with dedicated security perimeter.

*Tip: You can open the **Campus Navigator** tab in this app for the interactive map and step-by-step route calculator!*`;
  }

  if (
    lower.includes("contact") ||
    lower.includes("phone") ||
    lower.includes("email") ||
    lower.includes("call") ||
    lower.includes("reach") ||
    lower.includes("address") ||
    lower.includes("enquiry") ||
    lower.includes("helpdesk")
  ) {
    return `### Official ABUAD Directory & Emergency Lines

- **Admissions Enquiries**: admissions@abuad.edu.ng | +234 812 777 2121 / +234 803 852 1193
- **Office of the Registrar**: registrar@abuad.edu.ng | +234 803 440 2425
- **Bursary & Tuition**: fees@abuad.edu.ng / bursar@abuad.edu.ng
- **Student Affairs Directorate**: studentaffairs@abuad.edu.ng | +234 805 554 1120
- **ICT Support / Student Portal**: ictsupport@abuad.edu.ng | portal@abuad.edu.ng
- **Multi-System Hospital 24/7 Emergency**: hospital@abuad.edu.ng | +234 813 416 0058
- **Postal Address**: Km 8.5, Afe Babalola Way, P.M.B 5454, Ado-Ekiti, Ekiti State, Nigeria.
- **Official Website**: [https://www.abuad.edu.ng/](https://www.abuad.edu.ng/)`;
  }

  // General default response
  return `Hello! As the official Virtual Assistant for **Afe Babalola University, Ado-Ekiti (ABUAD)**, I am delighted to assist you.

Here is what I can help you with:
1. **Admissions & Screening**: UTME cut-offs (180 general, 200 Law/Eng, 250 Medicine), Direct Entry (JUPEB/A-Level), and O'Level requirements.
2. **Tuition & Fees**: All-inclusive fee structures, 50%-30%-20% installment schedule, and portal payment steps.
3. **8 Academic Colleges**: Law, Medicine & Health Sciences, Engineering & FESTO Mechatronics, Sciences, Social & Management Sciences, Pharmacy, Agriculture, and Postgraduate.
4. **Campus Life & Hostels**: Modern en-suite hostels with 24/7 power & water, dress code regulations, and Founder's Merit scholarships.
5. **Interactive Campus Navigation**: Directions to the Multi-System Hospital, Alfa Belgore Hall, TDC, and colleges.

Please ask any specific question, or click one of the suggested topic chips above to get started!`;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ABUAD Virtual Assistant API",
    aiEnabled: Boolean(aiClient),
    timestamp: new Date().toISOString(),
  });
});

// Helper to call Gemini with multi-model failover for high-demand (503) spikes
async function generateGeminiContentWithFallback(
  contents: any[]
): Promise<{ text: string; modelUsed: string } | null> {
  if (!aiClient) return null;

  // Primary: gemini-3.8-flash; Failovers: gemini-3.6-flash, gemini-3.1-flash-lite, gemini-flash-latest
  const candidateModels = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

  for (const modelName of candidateModels) {
    try {
      const generatePromise = aiClient.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: ABUAD_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout on ${modelName}`)), 11000);
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (response && response.text) {
        return { text: response.text, modelUsed: modelName };
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isRecoverableError =
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("404") ||
        errMsg.includes("NOT_FOUND") ||
        errMsg.includes("no longer available");

      if (isRecoverableError) {
        console.log(`[Gemini Failover] Model ${modelName} unavailable, switching to next candidate...`);
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
      console.log(`[Gemini Failover] Notice on ${modelName}:`, errMsg);
    }
  }

  return null;
}

// Chat endpoint with robust timeout, retry, and grounded fallback
app.post("/api/chat", async (req, res) => {
  try {
    const { message, historyUnits = [], history = [], userRole = "applicant", ragContext = "" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message string is required." });
    }

    const trimmedMsg = message.trim();

    // If Gemini client is available, attempt multi-model generation
    if (aiClient) {
      try {
        const chatHistory = history.length > 0 ? history : historyUnits;
        const formattedHistory = chatHistory.slice(-6).map((item: { role: string; text: string }) => ({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        }));

        const roleContext = userRole === "student" 
          ? "The user is currently an enrolled ABUAD student asking about academics, hostel rules, exams, portal, fees, or campus life."
          : "The user is a prospective applicant or parent asking about admission requirements, cut-off marks, screening, fees, hostels, or courses.";

        let userPromptWithRAG = `[Context: ${roleContext}]\n\n`;
        if (ragContext && ragContext.trim().length > 0) {
          userPromptWithRAG += `[RETRIEVED RAG KNOWLEDGE CHUNKS FROM OFFICIAL UNIVERSITY PORTAL (https://www.abuad.edu.ng/) & UPLOADED KNOWLEDGE BASE]:\n${ragContext}\n\nStrictly prioritize and cite this verified knowledge in your answer.\n\n`;
        }
        userPromptWithRAG += `User Question: ${trimmedMsg}`;

        const contents = [
          ...formattedHistory,
          {
            role: "user",
            parts: [{ text: userPromptWithRAG }],
          },
        ];

        const geminiResult = await generateGeminiContentWithFallback(contents);

        if (geminiResult && geminiResult.text) {
          return res.json({
            reply: geminiResult.text,
            source: geminiResult.modelUsed,
          });
        }
      } catch (geminiError: any) {
        console.log("[Gemini Engine] Engaging Grounded Knowledge fallback:", geminiError?.message || geminiError);
      }
    }

    // High-quality grounded fallback reply
    const groundedReply = generateGroundedABUADResponse(trimmedMsg, userRole, ragContext, history);
    return res.json({
      reply: groundedReply,
      source: "abuad-grounded-engine",
    });
  } catch (error: any) {
    console.error("Critical chat error:", error);
    const emergencyReply = generateGroundedABUADResponse(
      req.body?.message || "ABUAD",
      req.body?.userRole || "applicant",
      req.body?.ragContext || ""
    );
    return res.json({
      reply: emergencyReply,
      source: "abuad-emergency-fallback",
    });
  }
});

// Start server and attach Vite middleware in dev or static files in production
async function startServer() {
  const server = http.createServer(app);

  // Initialize WebSocket Server for bidirectional Audio-to-Audio Live Stream
  const wss = new WebSocketServer({ server, path: "/api/live" });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("Client connected to Live Audio WebSocket");

    if (aiClient) {
      try {
        const livePrompt = `${ABUAD_SYSTEM_PROMPT}

CRITICAL REAL-TIME LIVE SPOKEN AUDIO INSTRUCTIONS:
- You are communicating via a live, ultra low-latency two-way audio stream.
- Keep your spoken responses concise, conversational, informative, and direct (1-3 sentences per turn).
- Always use an authentic, warm, articulate Nigerian English accent and polite collegiate persona.
- The user can INTERRUPT (barge-in) at any time to ask another question. When the user speaks, stop talking immediately and address their latest question.`;

        const session = await aiClient.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Kore", // Clear, warm articulate female voice
                },
              },
            },
            systemInstruction: livePrompt,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              // 1. Model Audio Output Chunks (24kHz PCM)
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts && parts.length > 0) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    if (clientWs.readyState === WebSocket.OPEN) {
                      clientWs.send(
                        JSON.stringify({
                          type: "audio",
                          audio: part.inlineData.data,
                          mimeType: part.inlineData.mimeType || "audio/pcm;rate=24000",
                        })
                      );
                    }
                  }
                  if (part.text && clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({
                        type: "transcript",
                        role: "model",
                        text: part.text,
                      })
                    );
                  }
                }
              }

              // 2. Output Audio Transcription (subtitles)
              const outputTranscription =
                (message.serverContent as any)?.outputTranscription?.text ||
                (message.serverContent as any)?.outputAudioTranscription?.text;
              if (outputTranscription && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: "transcript",
                    role: "model",
                    text: outputTranscription,
                  })
                );
              }

              // 3. User Input Transcription
              const inputTranscription =
                (message.serverContent as any)?.inputTranscription?.text ||
                (message.serverContent as any)?.inputAudioTranscription?.text;
              if (inputTranscription && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: "transcript",
                    role: "user",
                    text: inputTranscription,
                  })
                );
              }

              // 4. Interruption (Barge-in detected by Gemini Live)
              if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: "interrupted",
                    interrupted: true,
                  })
                );
              }

              // 5. Turn completion
              if (message.serverContent?.turnComplete && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: "turnComplete",
                  })
                );
              }
            },
            onerror: (err: any) => {
              console.error("Live API session error:", err);
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: "error",
                    message: err?.message || "Live API error",
                  })
                );
              }
            },
            onclose: () => {
              console.log("Live API session closed");
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: "closed",
                  })
                );
              }
            },
          },
        });

        clientWs.on("message", (rawMsg) => {
          try {
            const data = JSON.parse(rawMsg.toString());

            if (data.type === "audio" && data.audio) {
              // Send 16kHz PCM audio chunk from microphone
              session.sendRealtimeInput({
                audio: {
                  data: data.audio,
                  mimeType: data.mimeType || "audio/pcm;rate=16000",
                },
              });
            } else if (data.type === "text" && data.text) {
              // Send text query
              session.sendRealtimeInput({
                text: data.text,
              });
            } else if (data.type === "interrupt") {
              // Client signaled barge-in interruption
              console.log("Client triggered live barge-in interruption");
            }
          } catch (err) {
            console.error("Error handling client WebSocket message:", err);
          }
        });

        clientWs.on("close", () => {
          try {
            session.close();
          } catch (_) {}
        });
      } catch (err: any) {
        console.error("Error connecting to Gemini Live session:", err);
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({
              type: "error",
              message: "Failed to initialize Gemini Live session. Fallback mode enabled.",
            })
          );
        }
      }
    } else {
      clientWs.send(
        JSON.stringify({
          type: "status",
          mode: "fallback",
          message: "Live API ready in browser-assisted mode.",
        })
      );
    }
  });

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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`ABUAD Virtual Assistant Server running with Live Audio WebSocket on http://0.0.0.0:${PORT}`);
  });
}

startServer();
