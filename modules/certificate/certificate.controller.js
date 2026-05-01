import puppeteer from "puppeteer";
import prisma from "../../config/prisma.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utils/errorResponse.js";

/**
 * @desc    Generate Certificate PDF
 * @route   POST /api/v1/certificates/generate
 * @access  Private
 */
export const generateCertificate = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;

  if (!courseId) {
    return next(new ErrorResponse("Please provide courseId", 400));
  }

  // Check if course is completed by the user
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: Number(req.user.id),
        courseId: Number(courseId),
      },
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!enrollment || enrollment.status !== "COMPLETED") {
    return next(
      new ErrorResponse(
        "Certificate can only be generated for completed courses",
        400,
      ),
    );
  }

  const name = enrollment.user.name;
  const course = enrollment.course.title;

  const PORT = process.env.PORT || 5000;
  const imagePath = `http://localhost:${PORT}/template/template.png`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    const html = `
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Droid+Serif:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Times New Roman', serif;
        }

        .certificate {
          position: relative;
          width: 1200px;
          height: 850px;
          overflow: hidden;
        }

        .bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 1200px;
          height: 850px;
          z-index: -1;
        }

        .name {
          position: absolute;
          top: 330px;
          width: 100%;
          text-align: center;
          font-size: 58px;
          font-weight: bold;
          color: #1a1a1a;
          font-family: 'Pinyon Script', cursive;
        }

        .description {
          position: absolute;
          top: 410px;
          width: 80%;
          left: 10%;
          text-align: center;
          font-size: 24px;
          line-height: 1.2;
          color: #3d3d3d;
          font-family: 'Droid Serif', serif;
        }

        .description p {
          margin: 10px 0;
        }

        .course {
          font-weight: bold;
          color: #1a1a1a;
        }
      </style>
    </head>

    <body>
      <div class="certificate">
        <img src="${imagePath}" class="bg"/>

        <div class="name">${name}</div>

        <div class="description">
          <p>
            has successfully completed the online course 
            <span class="course">“${course}”</span>, demonstrating<br/>
            proficiency in debate, argumentation, rebuttal, and critical thinking.
          </p>
          <p>
            Throughout the course, the participant has shown dedication, analytical ability, and<br/>
            effective communication skills in structured discourse.
          </p>
          <p>
            We proudly acknowledge this accomplishment and wish his/her continued success.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      width: "1200px",
      height: "850px",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=certificate_${name.replace(/\s+/g, "_")}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } finally {
    await browser.close();
  }
});
