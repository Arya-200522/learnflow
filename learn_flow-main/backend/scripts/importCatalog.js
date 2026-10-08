
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { connectDatabase } from "../src/config/db.js";
import Course from "../src/models/Course.js";
import Lesson from "../src/models/Lesson.js";
import PdfResource from "../src/models/PdfResource.js";
import { slugify } from "../src/utils/slugify.js";
import mongoose from "mongoose";

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, "..");

function resolveSource(source) {
  if (!source) return null;

  return path.isAbsolute(source)
    ? source
    : path.resolve(backendRoot, source);
}

function readCsv(source) {
  if (!source || !fs.existsSync(source)) {
    throw new Error(
      `CSV file not found: ${source || "not configured"}`
    );
  }

  return parse(fs.readFileSync(source, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
  });
}

async function run() {
  try {
    const videosPath = resolveSource(process.env.VIDEOS_CSV);
    const pdfsPath = resolveSource(process.env.PDFS_CSV);

    console.log("Videos CSV:", videosPath);
    console.log("PDFs CSV:", pdfsPath);

    const videos = readCsv(videosPath);
    const pdfs = readCsv(pdfsPath);

    console.log(`Loaded ${videos.length} videos`);
    console.log(`Loaded ${pdfs.length} PDFs`);

    await connectDatabase();

    console.log("MongoDB connected");

    const catalog = new Map();

    // Create course list
    for (const row of [...videos, ...pdfs]) {
      const name = row.course?.trim();

      if (!name) continue;

      if (!catalog.has(name)) {
        catalog.set(name, {
          name,
          slug: slugify(name),
          videoCount: 0,
          pdfCount: 0,
          totalDurationSec: 0,
        });
      }
    }

    // Count videos
    for (const row of videos) {
      const item = catalog.get(row.course?.trim());

      if (!item) continue;

      item.videoCount += 1;
      item.totalDurationSec += Number(row.duration_sec) || 0;
    }

    // Count PDFs
    for (const row of pdfs) {
      const item = catalog.get(row.course?.trim());

      if (item) {
        item.pdfCount += 1;
      }
    }

    // Save courses
    for (const item of catalog.values()) {
      await Course.findOneAndUpdate(
        { name: item.name },
        item,
        {
          upsert: true,
          new: true,
        }
      );
    }

    console.log(`Courses imported: ${catalog.size}`);

    // Get saved courses
    const courses = await Course.find({
      name: { $in: [...catalog.keys()] },
    });

    const courseByName = new Map(
      courses.map((course) => [course.name, course])
    );

    // Prepare lessons
    const lessonOps = videos
      .filter(
        (row) =>
          row.video_id &&
          courseByName.has(row.course?.trim())
      )
      .map((row) => {
        const course = courseByName.get(row.course.trim());

        return {
          updateOne: {
            filter: {
              videoId: row.video_id,
            },

            update: {
              $set: {
                course: course._id,
                courseName: course.name,
                courseSlug: course.slug,

                section:
                  row.section?.trim() || "General",

                title:
                  row.title?.trim() || "Untitled lesson",

                sourceId:
                  row.source_id || "",

                durationSec:
                  Number(row.duration_sec) || 0,

                hlsUrl:
                  row.m3u8_url || "",

                mp4Url:
                  row.mp4_url || "",

                sourceType:
                  row.type || "video",
              },
            },

            upsert: true,
          },
        };
      });

    // Prepare PDFs
    const pdfOps = pdfs
      .filter(
        (row) =>
          row.object_id &&
          row.pdf_url &&
          courseByName.has(row.course?.trim())
      )
      .map((row) => {
        const course = courseByName.get(row.course.trim());

        return {
          updateOne: {
            filter: {
              objectId: row.object_id,
            },

            update: {
              $set: {
                course: course._id,
                courseName: course.name,
                courseSlug: course.slug,

                title:
                  row.title?.trim() ||
                  "Untitled resource",

                pdfUrl: row.pdf_url,
              },
            },

            upsert: true,
          },
        };
      });

    // Insert videos
    if (lessonOps.length) {
      await Lesson.bulkWrite(
        lessonOps,
        {
          ordered: false,
        }
      );
    }

    // Insert PDFs
    if (pdfOps.length) {
      await PdfResource.bulkWrite(
        pdfOps,
        {
          ordered: false,
        }
      );
    }

    console.log(
      `Imported ${catalog.size} courses, ${lessonOps.length} videos and ${pdfOps.length} PDFs.`
    );

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
    console.log("IMPORT COMPLETED SUCCESSFULLY");
  } catch (error) {
    console.error("IMPORT ERROR:");
    console.error(error.message);

    await mongoose.disconnect();

    process.exit(1);
  }
}

run();