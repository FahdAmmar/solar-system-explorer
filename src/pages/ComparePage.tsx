import { PageTitle } from '@/components/common/PageTitle'
import { ComparisonView } from '@/features/comparison/components/ComparisonView'
import { PlanetsGate } from '@/features/planets/components/PlanetsGate'

export default function ComparePage() {
  return (
    <>
      <PageTitle title="Compare planets" />
      <PlanetsGate>{(planets) => <ComparisonView planets={planets} />}</PlanetsGate>
    </>
  )
}
