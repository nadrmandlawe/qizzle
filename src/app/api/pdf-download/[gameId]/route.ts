import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { NextResponse } from "next/server";

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
        pdfData: true,
      },
    });

    if (!game) {
      return new NextResponse("Game not found", { status: 404 });
    }

    if (!game.pdfData) {
      return new NextResponse("No PDF file associated with this game", { status: 404 });
    }

    // Convert base64 to Buffer
    const pdfBuffer = Buffer.from(game.pdfData, 'base64');

    // Set the appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${game.pdfName}"`);
    headers.set('Content-Length', pdfBuffer.length.toString());
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error in PDF download:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 