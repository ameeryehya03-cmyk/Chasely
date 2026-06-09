import StatsBar from '@/components/StatsBar'
import AgentsTable from '@/components/AgentsTable'

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Agent Database</h1>
          <p className="text-sm text-muted">Dubai real estate agents · Internal sourcing tool</p>
        </div>
      </div>
      <StatsBar />
      <AgentsTable />
    </div>
  )
}
