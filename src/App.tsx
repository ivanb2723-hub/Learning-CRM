import { DirectionCS0Replica } from './atlas/renderers/direction-c-proof/DirectionCS0Replica.tsx'
import { VisualAssetGate } from './atlas/visual-asset-gate/VisualAssetGate.tsx'
import { SystemAtlasMilestoneA } from './features/system-atlas-v2/SystemAtlasMilestoneA.tsx'
import { P1LearningPath } from './features/p1-learning-path/P1LearningPath.tsx'

function App() {
  const params = new URLSearchParams(window.location.search)

  if (params.get('gate') === 'visual-assets') {
    return <VisualAssetGate />
  }

  if (params.has('proof')) {
    return <DirectionCS0Replica />
  }

  if (params.get('p1Path') === '1') {
    return <P1LearningPath />
  }

  return <SystemAtlasMilestoneA />
}

export default App
