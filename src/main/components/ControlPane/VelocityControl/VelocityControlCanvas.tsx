import { GLCanvas, Transform } from "@ryohey/webgl-react"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useMemo } from "react"
import { IPoint, containsPoint } from "../../../../common/geometry"
import { isNoteEvent } from "../../../../common/track"
import { changeNotesVelocity } from "../../../actions"
import { matrixFromTranslation } from "../../../helpers/matrix"
import { observeDrag } from "../../../helpers/observeDrag"
import { useStores } from "../../../hooks/useStores"
import { Beats } from "../../GLNodes/Beats"
import { Cursor } from "../../GLNodes/Cursor"
import { VelocityItems } from "./VelocityItems"

export const VelocityControlCanvas: FC<{ width: number; height: number }> =
  observer(({ width, height }) => {
    const rootStore = useStores()
    const {
      pianoRollStore: {
        transform,
        scrollLeft,
        windowedEvents,
        rulerStore: { beats },
        cursorX,
      },
    } = rootStore
    const changeVelocity = useCallback(changeNotesVelocity(rootStore), [
      rootStore,
    ])

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
        const isRightClick = e.button === 2

        if (hitItems.length === 0 && !isRightClick) {
          return
        }

        const startY = e.clientY - e.offsetY

        const calcValue = (e: MouseEvent) => {
          const offsetY = e.clientY - startY
          return Math.round(
            Math.max(0, Math.min(1, 1 - offsetY / height)) * 127,
          )
        }

        const noteIds = hitItems.map((e) => e.id)

        changeVelocity(noteIds, calcValue(e))

        if(isRightClick) {
          observeDrag({
            onMouseMove: (e) => {
              const local = {
                x: e.offsetX + scrollLeft,
                y: e.offsetY,
              }
              const hitItems = hitTest(local)
              const noteIds = hitItems.map((e) => e.id)
              changeVelocity(noteIds, calcValue(e))
            },
          })
        } else {
          observeDrag({
            onMouseMove: (e) => changeVelocity(noteIds, calcValue(e)),
          })
        }
      },
      [height, items, changeVelocity],
    )

    const scrollXMatrix = useMemo(
      () => matrixFromTranslation(-scrollLeft, 0),
      [scrollLeft],
    )

    return (
      <GLCanvas width={width} height={height} onMouseDown={onMouseDown}>
        <Transform matrix={scrollXMatrix}>
          <VelocityItems rects={items} />
          <Beats height={height} beats={beats} zIndex={2} />
          <Cursor x={cursorX} height={height} zIndex={4} />
        </Transform>
      </GLCanvas>
    )
  })
