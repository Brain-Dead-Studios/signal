import { observer } from "mobx-react-lite"
import { useCallback, useMemo, VFC } from "react"
import { containsPoint, IPoint } from "../../../../common/geometry"
import { isNoteEvent } from "../../../../common/track"
import { changeNotesVelocity } from "../../../actions"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { observeDrag } from "../../../helpers/observeDrag"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLSurface/common/Beats"
import { Cursor } from "../../GLSurface/common/Cursor"
import { GLSurface } from "../../GLSurface/GLSurface"
import { Transform } from "../../GLSurface/Transform"
import { VelocityItems } from "./VelocityItems"

export const VelocityControlCanvas: VFC<{ width: number; height: number }> =
  observer(({ width, height }) => {
    const rootStore = useStores()
    const { transform, scrollLeft, windowedEvents } = rootStore.pianoRollStore
    const changeVelocity = useCallback(changeNotesVelocity(rootStore), [])

    const items = windowedEvents.filter(isNoteEvent).map((note) => {
      const { x } = transform.getRect(note)
      const itemWidth = 5
      const itemHeight = (note.velocity / 127) * height
      return {
        id: note.id,
        x,
        y: height - itemHeight,
        width: itemWidth,
        height: itemHeight,
        hitArea: {
          x,
          y: 0,
          width: itemWidth,
          height,
        },
      }
    })

    const hitTest = (point: IPoint) => {
      return items.filter((n) => containsPoint(n.hitArea, point))
    }

    const onMouseDown = useCallback(
      (ev: React.MouseEvent) => {
        const e = ev.nativeEvent
        const local = {
          x: e.offsetX + scrollLeft,
          y: e.offsetY,
        }
        const hitItems = hitTest(local)

        if (hitItems.length === 0) {
          return
        }

        const startY = e.clientY - e.offsetY

        const calcValue = (e: MouseEvent) => {
          const offsetY = e.clientY - startY
          return Math.round(
            Math.max(0, Math.min(1, 1 - offsetY / height)) * 127
          )
        }

        const noteIds = hitItems.map((e) => e.id)

        changeVelocity(noteIds, calcValue(e))

        observeDrag({
          onMouseMove: (e) => changeVelocity(noteIds, calcValue(e)),
        })
      },
      [height, items]
    )

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft]
    )

    return (
      <GLSurface width={width} height={height} onMouseDown={onMouseDown}>
        <Transform matrix={scrollXMatrix}>
          <VelocityItems rects={items} />
          <_Beats height={height} zIndex={2} />
          <_Cursor height={height} zIndex={4} />
        </Transform>
      </GLSurface>
    )
  })

const _Beats: VFC<{ height: number; zIndex: number }> = observer(
  ({ height, zIndex }) => {
    const rootStore = useStores()
    const {
      rulerStore: { beats },
    } = rootStore.pianoRollStore
    return <Beats height={height} beats={beats} zIndex={zIndex} />
  }
)

const _Cursor: VFC<{ height: number; zIndex: number }> = observer(
  ({ height, zIndex }) => {
    const rootStore = useStores()
    const { cursorX } = rootStore.pianoRollStore
    return <Cursor x={cursorX} height={height} zIndex={zIndex} />
  }
)
