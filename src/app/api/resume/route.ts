import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getContent } from "@/lib/data";

function downloadName(fullName: string, filePath: string) {
  const clean = fullName.trim().replace(/\s+/g, "-") || "Resume";
  const ext = path.extname(filePath).replace(".", "").toLowerCase() || "pdf";
  const safeExt = /^[a-z0-9]{2,5}$/.test(ext) ? ext : "pdf";
  return `${clean}-Resume.${safeExt}`;
}

function mimeFor(ext: string) {
  switch (ext.toLowerCase()) {
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return "application/octet-stream";
  }
}

function resolveLocalFile(resumeUrl: string) {
  const rel = resumeUrl.replace(/^\/+/, "");
  const publicRoot = path.resolve(process.cwd(), "public");
  const full = path.resolve(publicRoot, rel);
  if (!full.startsWith(publicRoot + path.sep) && full !== publicRoot) {
    return null;
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return null;
  return full;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const content = getContent();
  const resumeUrl = (content.about.resumeUrl || "").trim();
  const hasResume = Boolean(resumeUrl && resumeUrl !== "#");

  if (searchParams.get("meta") === "1") {
    return NextResponse.json({
      hasResume,
      resumeUrl: hasResume ? resumeUrl : null,
    });
  }

  if (!hasResume) {
    return NextResponse.json(
      { error: "No resume uploaded yet. Add one in Admin → Hero → Resume file." },
      { status: 404 }
    );
  }

  if (resumeUrl.startsWith("http://") || resumeUrl.startsWith("https://")) {
    return NextResponse.redirect(resumeUrl, 302);
  }

  const filePath = resolveLocalFile(resumeUrl);
  if (!filePath) {
    return NextResponse.json(
      { error: "Resume file is missing on the server. Re-upload it in Admin." },
      { status: 404 }
    );
  }

  const bytes = fs.readFileSync(filePath);
  const filename = downloadName(content.fullName, filePath);
  const ext = path.extname(filePath);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": mimeFor(ext),
      "Content-Length": String(bytes.length),
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
