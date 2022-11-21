/*
  Warnings:

  - A unique constraint covering the columns `[participantId,gameId]` on the table `Bets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bets_participantId_gameId_key" ON "Bets"("participantId", "gameId");
