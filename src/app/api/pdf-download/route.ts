const game = await prisma.game.findUnique({
  where: {
    id: gameId,
    userId: session.user.id,
  },
});

if (!game || !game.fileUrl || !game.pdfName) {
  return new Response("PDF not found", { status: 404 });
}

const filePath = path.join(process.cwd(), 'public', game.fileUrl); 