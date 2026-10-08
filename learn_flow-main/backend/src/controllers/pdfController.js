import axios from "axios";

import PdfResource from "../models/PdfResource.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedPdfHost = (hostname) => {
  const normalizedHostname =
    hostname.toLowerCase();

  return (
    normalizedHostname ===
      "api.asia-se1.learnworlds.com" ||
    normalizedHostname.endsWith(
      ".learnworlds.com",
    )
  );
};

const readErrorPreview = async (
  stream,
  maximumBytes = 4096,
) => {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.from(chunk);

    chunks.push(buffer);
    totalBytes += buffer.length;

    if (totalBytes >= maximumBytes) {
      stream.destroy();
      break;
    }
  }

  return Buffer.concat(chunks)
    .subarray(0, maximumBytes)
    .toString("utf8");
};

export const streamPdf = asyncHandler(
  async (req, res) => {
    const pdf = await PdfResource.findById(
      req.params.id,
    ).select("+pdfUrl title objectId");

    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: "PDF resource not found",
      });
    }

    if (!pdf.pdfUrl) {
      return res.status(400).json({
        success: false,
        message:
          "PDF URL is missing for this resource",
      });
    }

    let upstreamUrl;

    try {
      upstreamUrl = new URL(pdf.pdfUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid PDF URL",
      });
    }

    if (
      upstreamUrl.protocol !== "https:" ||
      !allowedPdfHost(upstreamUrl.hostname)
    ) {
      return res.status(400).json({
        success: false,
        message: "Unsupported PDF source",
        hostname: upstreamUrl.hostname,
      });
    }

    const requestHeaders = {
      Accept:
        "application/pdf, application/octet-stream;q=0.9, */*;q=0.8",
    };

    // Sirf official credentials available hone par add honge.
    if (
      process.env.LEARNWORLDS_ACCESS_TOKEN
    ) {
      requestHeaders.Authorization =
        `Bearer ${process.env.LEARNWORLDS_ACCESS_TOKEN}`;
    }

    if (process.env.LEARNWORLDS_CLIENT_ID) {
      requestHeaders["Lw-Client"] =
        process.env.LEARNWORLDS_CLIENT_ID;
    }

    let upstream;

    try {
      upstream = await axios.get(
        upstreamUrl.toString(),
        {
          responseType: "stream",
          timeout: 30000,
          maxRedirects: 5,
          headers: requestHeaders,

          // Upstream error ko manually handle karenge.
          validateStatus: () => true,
        },
      );
    } catch (error) {
      console.error("PDF UPSTREAM ERROR:", {
        message: error.message,
        url: upstreamUrl.toString(),
      });

      return res.status(502).json({
        success: false,
        message:
          "Could not connect to the PDF provider",
      });
    }

    if (
      upstream.status < 200 ||
      upstream.status >= 300
    ) {
      const errorPreview =
        await readErrorPreview(upstream.data);

      console.error("PDF PROVIDER REJECTED:", {
        status: upstream.status,
        contentType:
          upstream.headers["content-type"],
        url: upstreamUrl.toString(),
        response: errorPreview,
      });

      return res.status(502).json({
        success: false,
        message:
          "PDF provider rejected the request",
        upstreamStatus: upstream.status,
        details:
          process.env.NODE_ENV ===
          "development"
            ? errorPreview
            : undefined,
      });
    }

    const contentType = String(
      upstream.headers["content-type"] || "",
    ).toLowerCase();

    const isPdfResponse =
      contentType.includes("application/pdf") ||
      contentType.includes(
        "application/octet-stream",
      ) ||
      contentType.includes("binary/octet-stream");

    if (!isPdfResponse) {
      const responsePreview =
        await readErrorPreview(upstream.data);

      console.error("INVALID PDF RESPONSE:", {
        contentType,
        url: upstreamUrl.toString(),
        response: responsePreview,
      });

      return res.status(502).json({
        success: false,
        message:
          "The provider returned a non-PDF response",
        contentType,
        details:
          process.env.NODE_ENV ===
          "development"
            ? responsePreview
            : undefined,
      });
    }

    const safeFilename = String(
      pdf.title || pdf.objectId || "resource",
    )
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    res.status(200);

    res.setHeader(
      "Content-Type",
      contentType || "application/pdf",
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${safeFilename || "resource"}.pdf"`,
    );

    res.setHeader(
      "Cache-Control",
      "private, max-age=900",
    );

    // Hum complete PDF download kar rahe hain.
    // LearnWorlds ko browser Range header forward nahi hoga.
    res.setHeader("Accept-Ranges", "none");

    if (upstream.headers["content-length"]) {
      res.setHeader(
        "Content-Length",
        upstream.headers["content-length"],
      );
    }

    upstream.data.on("error", (error) => {
      console.error(
        "PDF STREAM ERROR:",
        error.message,
      );

      if (!res.headersSent) {
        res.status(502).end();
      } else {
        res.destroy(error);
      }
    });

    upstream.data.pipe(res);
  },
);