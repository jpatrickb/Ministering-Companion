import { storage } from "./storage";

export async function seedInitialContent() {
  try {
    // Check if content already exists
    const existingContent = await storage.getContentByKey("landing-hero-title");
    if (existingContent) {
      console.log("Content already seeded, skipping...");
      return;
    }

    console.log("Seeding initial content...");

    // Landing page content
    await storage.createContent({
      key: "landing-hero-title",
      title: "Landing Hero Title",
      content: "Ministering Companion",
      contentType: "text",
      category: "landing",
      sortOrder: 1,
    });

    await storage.createContent({
      key: "landing-hero-subtitle",
      title: "Landing Hero Subtitle",
      content: "Following Christ's perfect example of love and service. A sacred tool to help you record, analyze, and enhance your ministering efforts with AI-powered insights and gospel resources.",
      contentType: "text", 
      category: "landing",
      sortOrder: 2,
    });

    await storage.createContent({
      key: "landing-cta-button",
      title: "Landing CTA Button",
      content: "Begin Your Sacred Ministry",
      contentType: "text",
      category: "landing", 
      sortOrder: 3,
    });

    // Dashboard content
    await storage.createContent({
      key: "dashboard-welcome-message",
      title: "Dashboard Welcome Message",
      content: "Following Christ's example of love and service through inspired ministering",
      contentType: "text",
      category: "dashboard",
      sortOrder: 1,
    });

    // Features content
    await storage.createContent({
      key: "feature-voice-recording",
      title: "Voice Recording Feature",
      content: "Record your ministering visits using voice notes, making it easy to capture thoughts and impressions while they're fresh in your mind.",
      contentType: "text",
      category: "features",
      sortOrder: 1,
    });

    await storage.createContent({
      key: "feature-ai-insights",
      title: "AI-Powered Insights",
      content: "Receive thoughtful analysis and suggestions based on your visit records, helping you better understand and serve those you minister to.",
      contentType: "text",
      category: "features",
      sortOrder: 2,
    });

    await storage.createContent({
      key: "feature-gospel-resources",
      title: "Gospel Resources",
      content: "Access curated scriptures, talks, and service ideas that align with the needs and circumstances of those you minister to.",
      contentType: "text",
      category: "features",
      sortOrder: 3,
    });

    // Settings
    await storage.createSetting({
      key: "app-name",
      value: "Ministering Companion",
      description: "The name of the application",
      category: "branding",
      isPublic: true,
    });

    await storage.createSetting({
      key: "app-tagline",
      value: "Following Christ's example of love and service",
      description: "The application tagline",
      category: "branding",
      isPublic: true,
    });

    console.log("Initial content seeded successfully!");
  } catch (error) {
    console.error("Error seeding content:", error);
  }
}