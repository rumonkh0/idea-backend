import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: "./config/config.env" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  family: 4,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create the course
  const course = await prisma.course.create({
    data: {
      title: "IDEA Debating Society",
      description:
        "Comprehensive course on debating skills covering introduction, argumentation, research, public speaking, and advanced techniques.",
      level: "BEGINNER",
      language: "English",
      price: 0,
      status: "PUBLISHED",
      // instructorId is optional, so omitting it
    },
  });

  console.log("Created course:", course.id);

  // Module and lesson data
  const modulesData = [
    {
      title: "Introduction to Debating",
      sortOrder: 1,
      lessons: [
        {
          title: "What is Debate? – Importance, Objectives, and Impact",
          sortOrder: 1,
          videoUrl: "",
        },
        {
          title: "Types & Formats of Debate (Blanchalla Debate)",
          sortOrder: 2,
          videoUrl: "",
        },
        {
          title:
            "Structure of a Debate – Speaker Roles & Motions Hosting a Debate – Moderator's Role",
          sortOrder: 3,
          videoUrl: "",
        },
        { title: "Rules & Etiquette", sortOrder: 4, videoUrl: "" },
        { title: "Time discipline", sortOrder: 5, videoUrl: "" },
        { title: "Respectful rebuttals", sortOrder: 6, videoUrl: "" },
        {
          title: "How judges score debates - Live Judging & Feedback",
          sortOrder: 7,
          videoUrl: "",
        },
        { title: "Rubric-based evaluation", sortOrder: 8, videoUrl: "" },
        { title: "Individual performance review", sortOrder: 9, videoUrl: "" },
      ],
    },
    {
      title: "Argumentation & Logic",
      sortOrder: 2,
      lessons: [
        {
          title: "How to Build a Strong Argument (Claim-Evidence-Reasoning)",
          sortOrder: 1,
          videoUrl: "",
        },
        {
          title:
            "Logical Fallacies and How to Avoid Them (Ad hominem, Strawman, Slippery Slope, etc.)",
          sortOrder: 2,
          videoUrl: "",
        },
        {
          title: "Rebuttals – Identifying and Countering Arguments",
          sortOrder: 3,
          videoUrl: "",
        },
        {
          title:
            "Crossfire & Questioning, Question techniques, Handling tough questions",
          sortOrder: 4,
          videoUrl: "",
        },
        {
          title:
            "Persuasion Tools Ethos (credibility) Pathos (emotion) Logos (logic)",
          sortOrder: 5,
          videoUrl: "",
        },
      ],
    },
    {
      title: "Research & Preparation",
      sortOrder: 3,
      lessons: [
        {
          title: "Topic Analysis and Motion Breakdown",
          sortOrder: 1,
          videoUrl: "",
        },
        {
          title: "Case Building – Planning Your Team's Approach",
          sortOrder: 2,
          videoUrl: "",
        },
        {
          title: "Research Skills – Finding and Citing Reliable Evidence",
          sortOrder: 3,
          videoUrl: "",
        },
        {
          title: "Note-taking and Flowing Techniques",
          sortOrder: 4,
          videoUrl: "",
        },
      ],
    },
    {
      title: "Public Speaking & Delivery",
      sortOrder: 4,
      lessons: [
        {
          title: "Public Speaking Essentials – Voice, Tone, Confidence",
          sortOrder: 1,
          videoUrl: "",
        },
        {
          title: "Body Language, Eye Contact & Stage Presence",
          sortOrder: 2,
          videoUrl: "",
        },
        {
          title: "Persuasion Techniques – Ethos, Pathos, Logos",
          sortOrder: 3,
          videoUrl: "",
        },
        {
          title: "Handling Nervousness & Stage Fright",
          sortOrder: 4,
          videoUrl: "",
        },
      ],
    },
    {
      title: "Advanced Debating Skills",
      sortOrder: 5,
      lessons: [
        {
          title: "Crossfire, POIs, and On-the-Spot Thinking",
          sortOrder: 1,
          videoUrl: "",
        },
        {
          title: "Strategic Team Coordination in Debate",
          sortOrder: 2,
          videoUrl: "",
        },
        {
          title: "Timed Mock Debates + Judge Criteria & Feedback",
          sortOrder: 3,
          videoUrl: "",
        },
        { title: "Understanding Judge Feedback", sortOrder: 4, videoUrl: "" },
      ],
    },
  ];

  // Create modules and lessons
  for (const modData of modulesData) {
    const module = await prisma.module.create({
      data: {
        title: modData.title,
        sortOrder: modData.sortOrder,
        courseId: course.id,
      },
    });

    console.log("Created module:", module.title);

    for (const lesData of modData.lessons) {
      await prisma.lesson.create({
        data: {
          title: lesData.title,
          videoUrl: lesData.videoUrl,
          sortOrder: lesData.sortOrder,
          moduleId: module.id,
        },
      });
    }

    console.log(
      `Created ${modData.lessons.length} lessons for module: ${module.title}`,
    );
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
