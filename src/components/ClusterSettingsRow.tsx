const CLUSTER_THRESHOLD_OPTIONS = [15, 25, 40]
const COMPETITOR_RADIUS_OPTIONS = [10, 15, 25]

function PillGroup({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: number
  options: number[]
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-md px-2 py-1 ${
              value === opt ? 'bg-white shadow dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {opt} mi
          </button>
        ))}
      </div>
    </div>
  )
}

export function ClusterSettingsRow({
  clusterThreshold,
  onClusterThresholdChange,
  competitorRadius,
  onCompetitorRadiusChange
}: {
  clusterThreshold: number
  onClusterThresholdChange: (v: number) => void
  competitorRadius: number
  onCompetitorRadiusChange: (v: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <PillGroup
        label="Cluster radius"
        value={clusterThreshold}
        options={CLUSTER_THRESHOLD_OPTIONS}
        onChange={onClusterThresholdChange}
      />
      <PillGroup
        label="Competitor radius"
        value={competitorRadius}
        options={COMPETITOR_RADIUS_OPTIONS}
        onChange={onCompetitorRadiusChange}
      />
    </div>
  )
}

export { CLUSTER_THRESHOLD_OPTIONS, COMPETITOR_RADIUS_OPTIONS }
