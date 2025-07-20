import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertMinisteredPersonSchema, 
  insertMinisteringEntrySchema,
  insertGospelResourceSchema 
} from "@shared/schema";
import { transcribeAudio, analyzeMinisteringEntry, generateInsights } from "./services/openai";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /wav|mp3|m4a|ogg|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Ministered persons routes
  app.get("/api/people", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const people = await storage.getMinisteredPersons(userId);
      
      // Get latest entry for each person to show preview
      const peopleWithPreview = await Promise.all(
        people.map(async (person) => {
          const entries = await storage.getEntriesForPerson(person.id, userId);
          const latestEntry = entries[0];
          return {
            ...person,
            lastEntryPreview: latestEntry?.summary || latestEntry?.transcript?.substring(0, 100) + "..." || "",
            lastContact: latestEntry?.date || person.createdAt,
            totalEntries: entries.length,
          };
        })
      );
      
      res.json(peopleWithPreview);
    } catch (error) {
      console.error("Error fetching people:", error);
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  app.get("/api/people/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personId = parseInt(req.params.id);
      const person = await storage.getMinisteredPerson(personId, userId);
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      res.json(person);
    } catch (error) {
      console.error("Error fetching person:", error);
      res.status(500).json({ message: "Failed to fetch person" });
    }
  });

  app.post("/api/people", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personData = insertMinisteredPersonSchema.parse({
        ...req.body,
        userId,
      });
      
      const person = await storage.createMinisteredPerson(personData);
      res.json(person);
    } catch (error) {
      console.error("Error creating person:", error);
      res.status(400).json({ message: "Failed to create person", error: error.message });
    }
  });

  app.put("/api/people/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personId = parseInt(req.params.id);
      
      // Verify ownership
      const existingPerson = await storage.getMinisteredPerson(personId, userId);
      if (!existingPerson) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      const updatedPerson = await storage.updateMinisteredPerson(personId, req.body);
      res.json(updatedPerson);
    } catch (error) {
      console.error("Error updating person:", error);
      res.status(400).json({ message: "Failed to update person", error: error.message });
    }
  });

  app.delete("/api/people/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personId = parseInt(req.params.id);
      
      const deleted = await storage.deleteMinisteredPerson(personId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      res.json({ message: "Person deleted successfully" });
    } catch (error) {
      console.error("Error deleting person:", error);
      res.status(500).json({ message: "Failed to delete person" });
    }
  });

  // Ministering entries routes
  app.get("/api/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personId = parseInt(req.query.person_id as string);
      
      if (!personId) {
        return res.status(400).json({ message: "person_id is required" });
      }
      
      // Verify person belongs to user
      const person = await storage.getMinisteredPerson(personId, userId);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      const entries = await storage.getEntriesForPerson(personId, userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.get("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = parseInt(req.params.id);
      
      const entry = await storage.getEntry(entryId, userId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  // Audio transcription endpoint
  app.post("/api/transcribe", isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      const { text: transcript } = await transcribeAudio(req.file.path);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({ transcript });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: "Failed to transcribe audio", error: error.message });
    }
  });

  // AI analysis endpoint
  app.post("/api/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { transcript } = req.body;
      
      if (!transcript) {
        return res.status(400).json({ message: "Transcript is required" });
      }
      
      const analysis = await analyzeMinisteringEntry(transcript);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing entry:", error);
      res.status(500).json({ message: "Failed to analyze entry", error: error.message });
    }
  });

  // Save entry endpoint
  app.post("/api/save_entry", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertMinisteringEntrySchema.parse({
        ...req.body,
        userId,
        date: req.body.date ? new Date(req.body.date) : new Date(),
      });
      
      // Verify person belongs to user
      const person = await storage.getMinisteredPerson(entryData.personId, userId);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      const entry = await storage.createEntry(entryData);
      
      // Update person's updated timestamp
      await storage.updateMinisteredPerson(entryData.personId, { updatedAt: new Date() });
      
      res.json(entry);
    } catch (error) {
      console.error("Error saving entry:", error);
      res.status(400).json({ message: "Failed to save entry", error: error.message });
    }
  });

  // Insights endpoint
  app.get("/api/insights/:personId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const personId = parseInt(req.params.personId);
      
      // Verify person belongs to user
      const person = await storage.getMinisteredPerson(personId, userId);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      const entries = await storage.getEntriesForPerson(personId, userId);
      
      if (entries.length === 0) {
        return res.json({ patterns: [], suggestions: [] });
      }
      
      const insights = await generateInsights(
        entries.map(entry => ({
          transcript: entry.transcript,
          date: entry.date.toISOString(),
        }))
      );
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ message: "Failed to generate insights", error: error.message });
    }
  });

  // Gospel resources routes
  app.get("/api/resources", async (req, res) => {
    try {
      const resources = await storage.getGospelResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/featured", async (req, res) => {
    try {
      const resources = await storage.getFeaturedResources();
      res.json(resources);
    } catch (error) {
      console.error("Error fetching featured resources:", error);
      res.status(500).json({ message: "Failed to fetch featured resources" });
    }
  });

  app.post("/api/resources", isAuthenticated, async (req: any, res) => {
    try {
      const resourceData = insertGospelResourceSchema.parse(req.body);
      const resource = await storage.createGospelResource(resourceData);
      res.json(resource);
    } catch (error) {
      console.error("Error creating resource:", error);
      res.status(400).json({ message: "Failed to create resource", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
