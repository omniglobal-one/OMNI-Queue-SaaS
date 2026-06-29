import { notFound } from 'next/navigation'
import { getTicketWithPosition } from '@/app/actions/tickets'
import { TicketViewClient } from './TicketViewClient'

export default async function TicketPage({ params }: { params: Promise<{ slug: string; ticketId: string }> }) {
  const { ticketId } = await params
  const { ticket, queue, livePosition, pendingAhead } = await getTicketWithPosition(ticketId)

  if (!ticket || !queue) notFound()

  return (
    <TicketViewClient
      initialTicket={ticket}
      initialQueue={queue}
      initialPosition={livePosition}
      initialPendingAhead={pendingAhead}
    />
  )
}
