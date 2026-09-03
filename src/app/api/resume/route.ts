import { NextResponse } from "next/server";
import path from "path";
import { getContent } from "@/lib/data";
import { readMediaFile } from "@/lib/media-store";
import { beginData } from "@/lib/api-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function downloadName(fullName: string, filePath: string) {
  const clean = fullName.trim().replace(/\s+/g, "-") || "Resume";
  const ext = path.extname(filePath).replace(".", "").toLowerCase() || "pdf";
  const safeExt = /^[a-z0-9]{2,5}$/.test(ext) ? ext : "pdf";
  return `${clean}-Resume.${safeExt}`;
}

export async function GET(req: Request) {
  try {
    await beginData();
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

    const fileName = path.basename(resumeUrl.replace(/^\/+/, ""));
    const media = await readMediaFile(fileName);
    if (!media) {
      return NextResponse.json(
        { error: "Resume file is missing on the server. Re-upload it in Admin." },
        { status: 404 }
      );
    }

    const filename = downloadName(content.fullName, fileName);

    return new NextResponse(new Uint8Array(media.bytes), {
      status: 200,
      headers: {
        "Content-Type": media.contentType,
        "Content-Length": String(media.bytes.length),
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Resume error";
    console.error("[resume]", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
