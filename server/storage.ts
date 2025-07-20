import {
  users,
  ministeredPersons,
  ministeringEntries,
  gospelResources,
  appContent,
  appSettings,
  type User,
  type UpsertUser,
  type InsertMinisteredPerson,
  type MinisteredPerson,
  type InsertMinisteringEntry,
  type MinisteringEntry,
  type InsertGospelResource,
  type GospelResource,
  type InsertAppContent,
  type AppContent,
  type InsertAppSettings,
  type AppSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Ministered persons operations
  getMinisteredPersons(userId: string): Promise<MinisteredPerson[]>;
  getMinisteredPerson(id: number, userId: string): Promise<MinisteredPerson | undefined>;
  createMinisteredPerson(person: InsertMinisteredPerson): Promise<MinisteredPerson>;
  updateMinisteredPerson(id: number, person: Partial<InsertMinisteredPerson>): Promise<MinisteredPerson | undefined>;
  deleteMinisteredPerson(id: number, userId: string): Promise<boolean>;
  
  // Ministering entries operations
  getEntriesForPerson(personId: number, userId: string): Promise<MinisteringEntry[]>;
  getEntry(id: number, userId: string): Promise<MinisteringEntry | undefined>;
  createEntry(entry: InsertMinisteringEntry): Promise<MinisteringEntry>;
  updateEntry(id: number, entry: Partial<InsertMinisteringEntry>): Promise<MinisteringEntry | undefined>;
  deleteEntry(id: number, userId: string): Promise<boolean>;
  
  // Gospel resources operations
  getGospelResources(): Promise<GospelResource[]>;
  getFeaturedResources(): Promise<GospelResource[]>;
  createGospelResource(resource: InsertGospelResource): Promise<GospelResource>;

  // Content management operations
  getContentByKey(key: string): Promise<AppContent | undefined>;
  getContentByCategory(category: string): Promise<AppContent[]>;
  getAllContent(): Promise<AppContent[]>;
  createContent(content: InsertAppContent): Promise<AppContent>;
  updateContent(id: number, content: Partial<InsertAppContent>): Promise<AppContent>;
  
  // Settings operations
  getSettingByKey(key: string): Promise<AppSettings | undefined>;
  getPublicSettings(): Promise<AppSettings[]>;
  createSetting(setting: InsertAppSettings): Promise<AppSettings>;
  updateSetting(id: number, setting: Partial<InsertAppSettings>): Promise<AppSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Ministered persons operations
  async getMinisteredPersons(userId: string): Promise<MinisteredPerson[]> {
    return await db
      .select()
      .from(ministeredPersons)
      .where(eq(ministeredPersons.userId, userId))
      .orderBy(desc(ministeredPersons.updatedAt));
  }

  async getMinisteredPerson(id: number, userId: string): Promise<MinisteredPerson | undefined> {
    const [person] = await db
      .select()
      .from(ministeredPersons)
      .where(and(eq(ministeredPersons.id, id), eq(ministeredPersons.userId, userId)));
    return person;
  }

  async createMinisteredPerson(person: InsertMinisteredPerson): Promise<MinisteredPerson> {
    const [newPerson] = await db
      .insert(ministeredPersons)
      .values(person)
      .returning();
    return newPerson;
  }

  async updateMinisteredPerson(id: number, person: Partial<InsertMinisteredPerson>): Promise<MinisteredPerson | undefined> {
    const [updatedPerson] = await db
      .update(ministeredPersons)
      .set({ ...person, updatedAt: new Date() })
      .where(eq(ministeredPersons.id, id))
      .returning();
    return updatedPerson;
  }

  async deleteMinisteredPerson(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(ministeredPersons)
      .where(and(eq(ministeredPersons.id, id), eq(ministeredPersons.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Ministering entries operations
  async getEntriesForPerson(personId: number, userId: string): Promise<MinisteringEntry[]> {
    return await db
      .select()
      .from(ministeringEntries)
      .where(and(eq(ministeringEntries.personId, personId), eq(ministeringEntries.userId, userId)))
      .orderBy(desc(ministeringEntries.date));
  }

  async getEntry(id: number, userId: string): Promise<MinisteringEntry | undefined> {
    const [entry] = await db
      .select()
      .from(ministeringEntries)
      .where(and(eq(ministeringEntries.id, id), eq(ministeringEntries.userId, userId)));
    return entry;
  }

  async createEntry(entry: InsertMinisteringEntry): Promise<MinisteringEntry> {
    const [newEntry] = await db
      .insert(ministeringEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async updateEntry(id: number, entry: Partial<InsertMinisteringEntry>): Promise<MinisteringEntry | undefined> {
    const [updatedEntry] = await db
      .update(ministeringEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(ministeringEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteEntry(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(ministeringEntries)
      .where(and(eq(ministeringEntries.id, id), eq(ministeringEntries.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Gospel resources operations
  async getGospelResources(): Promise<GospelResource[]> {
    return await db
      .select()
      .from(gospelResources)
      .orderBy(desc(gospelResources.featured), desc(gospelResources.createdAt));
  }

  async getFeaturedResources(): Promise<GospelResource[]> {
    return await db
      .select()
      .from(gospelResources)
      .where(eq(gospelResources.featured, true))
      .orderBy(desc(gospelResources.createdAt));
  }

  async createGospelResource(resource: InsertGospelResource): Promise<GospelResource> {
    const [newResource] = await db
      .insert(gospelResources)
      .values(resource)
      .returning();
    return newResource;
  }

  // Content management operations
  async getContentByKey(key: string): Promise<AppContent | undefined> {
    const [content] = await db
      .select()
      .from(appContent)
      .where(and(eq(appContent.key, key), eq(appContent.isActive, true)));
    return content;
  }

  async getContentByCategory(category: string): Promise<AppContent[]> {
    return await db
      .select()
      .from(appContent)
      .where(and(eq(appContent.category, category), eq(appContent.isActive, true)))
      .orderBy(appContent.sortOrder, appContent.title);
  }

  async getAllContent(): Promise<AppContent[]> {
    return await db
      .select()
      .from(appContent)
      .where(eq(appContent.isActive, true))
      .orderBy(appContent.category, appContent.sortOrder, appContent.title);
  }

  async createContent(content: InsertAppContent): Promise<AppContent> {
    const [newContent] = await db
      .insert(appContent)
      .values(content)
      .returning();
    return newContent;
  }

  async updateContent(id: number, content: Partial<InsertAppContent>): Promise<AppContent> {
    const [updatedContent] = await db
      .update(appContent)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(appContent.id, id))
      .returning();
    return updatedContent;
  }

  // Settings operations
  async getSettingByKey(key: string): Promise<AppSettings | undefined> {
    const [setting] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, key));
    return setting;
  }

  async getPublicSettings(): Promise<AppSettings[]> {
    return await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.isPublic, true))
      .orderBy(appSettings.category, appSettings.key);
  }

  async createSetting(setting: InsertAppSettings): Promise<AppSettings> {
    const [newSetting] = await db
      .insert(appSettings)
      .values(setting)
      .returning();
    return newSetting;
  }

  async updateSetting(id: number, setting: Partial<InsertAppSettings>): Promise<AppSettings> {
    const [updatedSetting] = await db
      .update(appSettings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(appSettings.id, id))
      .returning();
    return updatedSetting;
  }
}

export const storage = new DatabaseStorage();
