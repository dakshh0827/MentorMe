// Validate required environment variables
if (!import.meta.env.VITE_GROQ_API_KEY) {
  console.warn(
    "Warning: GROQ_API_KEY is missing in the .env file. The chatbot may not function properly."
  );
}

const config = {
  apiKey: import.meta.env.VITE_GROQ_API_KEY || "",
  port: import.meta.env.VITE_PORT || 5001,

  models: {
    qwen: import.meta.env.VITE_MODEL_QWEN || "qwen-qwq-32b",
    llama: import.meta.env.VITE_MODEL_LLAMA || "llama3-70b-8192",
  },

  chatbotPrompts: {
    career_guidance: "I'm interested in AI and Machine Learning. What career paths should I explore?",
    internships: "How can I get an internship at Google or Microsoft?",
    freelancing: "Is freelancing a good option for a student?",
    career_switch: "I want to switch to a tech career, but I feel like it’s too late. Is it still possible?",
    networking: "How can I network with professionals in the tech industry as a beginner?",
    remote_work: "Is remote work a good option for software engineers? How do I get remote jobs?",

    skill_development: "What are the most important skills for a software engineer?",
    resume_tips: "How do I write a strong resume for a fresh graduate?",
    interview_prep: "What are the most commonly asked data structures and algorithms interview questions?",
    problem_solving: "How can I improve my problem-solving skills for coding challenges?",
    study_tips: "How can I improve my focus while studying?",
    time_management: "I feel like I have too much to learn and too little time. How do I prioritize?",
    learning_coding: "I feel like I'm struggling to learn programming. How can I stay motivated?",
    project_guidance: "I want to start a personal tech project, but I don’t know where to begin. Can you guide me?",
    open_source: "I want to contribute to open-source projects, but I don’t know how to start. Any tips?",
    AI_learning: "I want to get into AI/ML but it seems overwhelming. What’s the best way to start?",
    hackathons: "Are hackathons a good way to improve my technical skills? How can I prepare?",
    tech_roadmap: "What’s a good roadmap to becoming a full-stack developer?",

    motivation: "I feel burned out while preparing for exams. How can I stay motivated?",
    imposter_syndrome: "I feel like I’m not good enough as a developer. How can I overcome imposter syndrome?",
    burnout_tech: "I feel exhausted from coding too much. How can I avoid burnout while still making progress?",
    debugging: "I’ve been stuck on a coding bug for hours. How do I stay focused and not get frustrated?",
    productivity: "How can I balance learning new tech skills while handling school or work?",
  },

  responseConfig: {
    maxTokensShort: 40, // Approx. 40 words
    maxTokensLong: 150, // For detailed responses
    promptShort: "Respond in 40 words max. Avoid special characters and formatting symbols.",
    promptLong: "Provide a detailed response. Avoid special characters and formatting symbols.",
  },

  getResponseConfig: (userMessage) => {
    const detailedRequestKeywords = ["more details", "elaborate", "explain in detail", "provide more info"];
    const isDetailedRequest = detailedRequestKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));

    return {
      maxTokens: isDetailedRequest ? config.responseConfig.maxTokensLong : config.responseConfig.maxTokensShort,
      systemPrompt: isDetailedRequest ? config.responseConfig.promptLong : config.responseConfig.promptShort,
    };
  },
};

export default config;
