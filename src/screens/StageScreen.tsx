import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'

import { Text } from 'components/shared'
import { Stage } from 'interfaces/shared'

export default function StageScreen({
  handleComplete,
  stage,
}: {
  stage: Stage
}): JSX.Element {
  const animationPaths: Record<Stage, string> = {
    casual: 'stage-01',
    intimate: 'stage-02',
    critical: 'stage-03',
  }

  const backgrounds: Record<Stage, string> = {
    casual: 'f6c45e',
    intimate: 'e28386',
    critical: '5a7ba3',
  }

  return (
    <div className='flex flex-expand justify-center h-100 overflow-hidden'>
      <div
        ref={(container) =>
          lottie
            .loadAnimation({
              container,
              renderer: 'svg',
              loop: false,
              autoplay: true,
              path: `/assets/lottie/${animationPaths[stage]}.json`,
            })
            .addEventListener('complete', handleComplete)
        }
        className='background-no-repeat background-center'
        style={{
          backgroundColor: `#${backgrounds[stage]}`,
          backgroundImage: 'url(/assets/svgs/sun.svg)',
          flex: '1 1 auto',
        }}
      />
      <div className='absolute' style={{ bottom: '1rem' }}>
        <Text as='body2' className='color-dark fw-700 text-center' element='p'>
          ACP related content was co-developed
          <br />
          with AIC, ACP National Office.
        </Text>
      </div>
    </div>
  )
}
