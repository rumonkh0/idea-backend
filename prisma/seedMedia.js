import prisma from "../config/prisma.js";

const TV_MEDIA_REPORTS = [
  {
    id: 1,
    channel: "চ্যানেল আই",
    topic: "জীবন যেখানে যেমন - আমাদের স্যার",
    link: "https://youtu.be/IFLytBklp7A?si=jtnQChDRgCd57R13",
    platform: "YouTube",
    isAvailable: true,
  },
  {
    id: 2,
    channel: "একাত্তর টিভি",
    topic: "একজন আদর্শ শিক্ষকের গল্প",
    link: "https://youtu.be/tFZGUYHbEGY?si=mteGOWwlbQ8xbJGx",
    platform: "YouTube",
    isAvailable: true,
  },
  {
    id: 3,
    channel: "মাছরাঙা টেলিভিশন",
    topic: "রাঙাসকাল – অতিথি : জনাব মোঃ হামিদুল হক",
    link: "https://youtu.be/AyF4GWKZDEg?si=Bq3oK71Iq4pOalYX",
    platform: "YouTube",
    isAvailable: true,
  },
  {
    id: 4,
    channel: "চ্যানেল ওয়ান",
    topic: "একজন শিক্ষক, একজন আপনজনা",
    link: "#",
    platform: "TV",
    isAvailable: false,
  },
  {
    id: 5,
    channel: "একাত্তর টিভি",
    topic: "যেভাবে শত শত শিক্ষার্থীদের বদলে দিলেন একজন শিক্ষক",
    link: "https://www.facebook.com/share/v/1BQFxUCCg1/",
    platform: "Facebook",
    isAvailable: true,
  },
  {
    id: 6,
    channel: "চ্যানেল ২৪",
    topic: "আইডিয়া লস প্রজেক্ট",
    link: "#",
    platform: "TV",
    isAvailable: false,
  },
  {
    id: 7,
    channel: "ডিবিসি নিউজ",
    topic: "শিক্ষায় নতুন দিগন্ত – আইডিয়া মডেল",
    link: "#",
    platform: "TV",
    isAvailable: false,
  },
  {
    id: 8,
    channel: "সময় টিভি",
    topic: "তরুণদের আত্মনির্ভরশীলতায় আইডিয়ার ভূমিকা",
    link: "#",
    platform: "TV",
    isAvailable: false,
  },
  {
    id: 9,
    channel: "এটিএন বাংলা",
    topic: "আইডিয়া স্পোকেন ও গেইম মেথড ফিচার",
    link: "#",
    platform: "TV",
    isAvailable: false,
  },
  {
    id: 10,
    channel: "ইন্ডিপেন্ডেন্ট টিভি",
    topic: "আলোকিত মানুষ গড়ার কারিগর",
    link: "#",
    platform: "TV",
    isAvailable: false,
  },
];

const NEWSPAPER_CLIPS = [
  {
    id: 1,
    title: "দৈনিক প্রথম আলো - বিশেষ প্রতিবেদন",
    image: "/images/wings/youth-development.jpg",
    date: "১৫ মে, ২০২২",
    isAvailable: true,
  },
  {
    id: 2,
    title: "দৈনিক ইত্তেফাক - আইডিয়ার সাফল্যগাথা",
    image: "/images/wings/social-welfare.jpg",
    date: "১০ আগস্ট, ২০২১",
    isAvailable: true,
  },
  {
    id: 3,
    title: "দৈনিক সমকাল - উদ্যোক্তা তৈরিতে আইডিয়া",
    image: "/images/wings/pitha-pathshala.jpg",
    date: "০৪ জানুয়ারি, ২০২৩",
    isAvailable: true,
  },
  {
    id: 4,
    title: "দৈনিক কালের কণ্ঠ - শিক্ষক হামিদুল হকের গল্প",
    image: "/images/wings/pitha-research.jpg",
    date: "১৮ নভেম্বর, ২০২০",
    isAvailable: true,
  },
  {
    id: 5,
    title: "দৈনিক যুগান্তর - পিঠা গবেষণা ও ঐতিহ্য",
    image: "/images/wings/widen.jpg",
    date: "১২ ফেব্রুয়ারি, ২০২৪",
    isAvailable: true,
  },
  {
    id: 6,
    title: "দৈনিক বাংলাদেশ প্রতিদিন - আইডিয়া স্পোকেন মেথড",
    image: "/images/wings/rise-thrive.jpg",
    date: "০৫ সেপ্টেম্বর, ২০২৪",
    isAvailable: true,
  },
];

async function seed() {
  console.log("Seeding TV Media Reports...");
  for (const report of TV_MEDIA_REPORTS) {
    await prisma.tvMediaReport.upsert({
      where: { id: report.id },
      update: report,
      create: report,
    });
  }

  console.log("Seeding Newspaper Clips with Media table relations...");
  for (const clip of NEWSPAPER_CLIPS) {
    // Create or find Media record
    let media = await prisma.media.findFirst({
      where: { url: clip.image },
    });

    if (!media) {
      media = await prisma.media.create({
        data: {
          url: clip.image,
          type: "IMAGE",
          provider: "local",
          alt: clip.title,
        },
      });
    }

    await prisma.newspaperClip.upsert({
      where: { id: clip.id },
      update: {
        title: clip.title,
        date: clip.date,
        isAvailable: clip.isAvailable,
        imageId: media.id,
      },
      create: {
        id: clip.id,
        title: clip.title,
        date: clip.date,
        isAvailable: clip.isAvailable,
        imageId: media.id,
      },
    });
  }

  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
