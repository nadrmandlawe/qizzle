import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const game = await prisma.game.findUnique({
      where: {
        id: (await params).gameId,
        userId: session.user.id,
      },
      select: {
        pdfUrl: true,
        pdfName: true,
      },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (!game.pdfUrl || !game.pdfName) {
      return new NextResponse("No PDF file associated with this game", { status: 404 });
    }

    // Get the absolute file path
    const filePath = path.join(process.cwd(), 'public', game.pdfUrl);

    try {
      // Read the file
      const fileBuffer = await fs.readFile(filePath);

      // Set the appropriate headers for file download
      const headers = new Headers();
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Disposition', `attachment; filename="${game.pdfName}"`);
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error("Error reading PDF file:", error);
      return new NextResponse("PDF file not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error in PDF download:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 