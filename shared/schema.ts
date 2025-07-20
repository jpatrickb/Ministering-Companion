import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ministered persons table
export const ministeredPersons = pgTable("ministered_persons", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  family: varchar("family"),
  tags: text("tags").array(),
  status: varchar("status").notNull().default("active"), // active, inactive, follow-up
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ministering entries table
export const ministeringEntries = pgTable("ministering_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  personId: integer("person_id").notNull().references(() => ministeredPersons.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  transcript: text("transcript").notNull(),
  summary: text("summary"),
  followups: text("followups").array(),
  scriptures: text("scriptures").array(),
  talks: text("talks").array(),
  notes: text("notes"),
  audioUrl: varchar("audio_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gospel resources table
export const gospelResources = pgTable("gospel_resources", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  author: varchar("author"),
  type: varchar("type").notNull(), // talk, scripture, article, service_idea
  url: varchar("url"),
  description: text("description"),
  tags: text("tags").array(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ministeredPersons: many(ministeredPersons),
  ministeringEntries: many(ministeringEntries),
}));

export const ministeredPersonsRelations = relations(ministeredPersons, ({ one, many }) => ({
  user: one(users, {
    fields: [ministeredPersons.userId],
    references: [users.id],
  }),
  entries: many(ministeringEntries),
}));

export const ministeringEntriesRelations = relations(ministeringEntries, ({ one }) => ({
  user: one(users, {
    fields: [ministeringEntries.userId],
    references: [users.id],
  }),
  person: one(ministeredPersons, {
    fields: [ministeringEntries.personId],
    references: [ministeredPersons.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertMinisteredPersonSchema = createInsertSchema(ministeredPersons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMinisteringEntrySchema = createInsertSchema(ministeringEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGospelResourceSchema = createInsertSchema(gospelResources).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema> & { id: string };
export type User = typeof users.$inferSelect;
export type InsertMinisteredPerson = z.infer<typeof insertMinisteredPersonSchema>;
export type MinisteredPerson = typeof ministeredPersons.$inferSelect;
export type InsertMinisteringEntry = z.infer<typeof insertMinisteringEntrySchema>;
export type MinisteringEntry = typeof ministeringEntries.$inferSelect;
export type InsertGospelResource = z.infer<typeof insertGospelResourceSchema>;
export type GospelResource = typeof gospelResources.$inferSelect;

// Content management tables
export const appContent = pgTable("app_content", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  title: varchar("title", { length: 200 }),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }).default("text").notNull(), // text, html, markdown
  isActive: boolean("is_active").default(true).notNull(),
  category: varchar("category", { length: 50 }), // landing, dashboard, resources, etc.
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  isPublic: boolean("is_public").default(false).notNull(), // whether setting is exposed to frontend
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppContentSchema = createInsertSchema(appContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAppContent = z.infer<typeof insertAppContentSchema>;
export type AppContent = typeof appContent.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type AppSettings = typeof appSettings.$inferSelect;
