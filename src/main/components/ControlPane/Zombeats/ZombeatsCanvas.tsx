import { vec2 } from "gl-matrix"
import { CanvasHTMLAttributes, Component } from "react"
import { assemble } from "../../../../common/helpers/noteAssembler"
import Player from "../../../../common/player/Player"
import { PlayerEvent } from "../../../../common/player/PlayerEvent"
import { NoteEvent } from "../../../../common/track"
import RootStore from "../../../stores/RootStore"

enum ZombieType {
  NORMAL = 60,
  SLOW = 61,
  CURVED = 62,
  ACCELERATING = 63,
  IMMORTAL = 59,
  IMMORTAL_SPINNING = 58,
}

const HITCIRCLE_RAD = 100
const SPEED = 200
const SPAWN_SECONDS = 4
const IMMORTAL_CREEP = 0.7
const IMMORTAL_SPINNING_CREEP = 0.5

function positionOfZombie(
  zombieType: ZombieType,
  angle: number,
  timeAlive: number,
  duration: number,
): vec2 {
  let pos = vec2.fromValues(Math.cos(angle), Math.sin(angle))
  if (zombieType == ZombieType.ACCELERATING) {
    vec2.scale(
      pos,
      pos,
      HITCIRCLE_RAD +
        ((timeAlive * SPEED * 2 * timeAlive) / 2) * (timeAlive > 0 ? 1 : -1),
    )
  } else if (zombieType == ZombieType.CURVED) {
    pos = vec2.fromValues(
      Math.cos(angle + (timeAlive / SPAWN_SECONDS) * Math.PI),
      Math.sin(angle + (timeAlive / SPAWN_SECONDS) * Math.PI),
    )
    vec2.scale(pos, pos, HITCIRCLE_RAD + SPEED * timeAlive)
  } else if (zombieType == ZombieType.SLOW) {
    //pos *= (float)(HITCIRCLE_RAD + SPEED * timeAlive * 0.5f);
    vec2.scale(pos, pos, HITCIRCLE_RAD + SPEED * timeAlive * 0.5)
  } else if (zombieType == ZombieType.NORMAL) {
    //pos *= (float)(HITCIRCLE_RAD + SPEED * timeAlive)
    vec2.scale(pos, pos, HITCIRCLE_RAD + SPEED * timeAlive)
  } else if (zombieType == ZombieType.IMMORTAL) {
    if (timeAlive > 0) {
      //pos *= (float)(HITCIRCLE_RAD + timeAlive * SPEED * 2 * timeAlive / 2);
      vec2.scale(
        pos,
        pos,
        HITCIRCLE_RAD + (timeAlive * SPEED * 2 * timeAlive) / 2,
      )
    } else {
      //pos *= (float)(HITCIRCLE_RAD + (IMMORTAL_CREEP * HITCIRCLE_RAD * timeAlive / duration));
      // time alive is negative so they approach at speeds inversely proportional to duration, always ending slightly outside center
      vec2.scale(
        pos,
        pos,
        HITCIRCLE_RAD + (IMMORTAL_CREEP * HITCIRCLE_RAD * timeAlive) / duration,
      )
    }
  } else if (zombieType == ZombieType.IMMORTAL_SPINNING) {
    pos = vec2.fromValues(
      Math.cos(angle + (timeAlive / 4) * Math.PI),
      Math.sin(angle + (timeAlive / 4) * Math.PI),
    )
    if (timeAlive > 0) {
      vec2.scale(
        pos,
        pos,
        HITCIRCLE_RAD + (timeAlive * SPEED * 2 * timeAlive) / 2,
      )
    } else {
      vec2.scale(
        pos,
        pos,
        HITCIRCLE_RAD +
          (IMMORTAL_SPINNING_CREEP * HITCIRCLE_RAD * timeAlive) / duration,
      )
    }
  }

  return pos
}

function velocityToAngle(velocity: number) {
  return (velocity / 127.0) * 2 * Math.PI
}

export interface ZombeatsCanvasProps
  extends CanvasHTMLAttributes<HTMLCanvasElement> {
  rootStore: RootStore
}

const LOOKAHEAD_TICKS = 4000

export default class ZombeatsCanvas extends Component<ZombeatsCanvasProps> {
  private canvas: HTMLCanvasElement | undefined
  private ctx: CanvasRenderingContext2D | undefined
  private interval?: number = undefined

  componentDidMount() {
    const ctx = this.canvas?.getContext("2d")
    if (ctx === null) {
      throw new Error("failed to getContext 2d")
    }
    this.ctx = ctx
    this.interval = window.setInterval(this.drawCanvas, 1000 / 60)
  }

  componentDidUpdate() {
    this.drawCanvas()
  }

  componentWillUnmount(): void {
    window.clearInterval(this.interval)
  }

  tickToMillisec(tick: number, bpm: number) {
    return (tick / (480 / 60) / bpm) * 1000
  }

  drawCanvas = () => {
    const rootStore: RootStore = this.props.rootStore
    const song = rootStore.song
    const player: Player = rootStore.player

    const events: (PlayerEvent | NoteEvent)[] = assemble<PlayerEvent>(
      song.allEvents,
    )

    const { ctx, canvas } = this
    if (!ctx || !canvas) return
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, HITCIRCLE_RAD, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.closePath()

    ctx.fillStyle = "#FF0000"

    for (const event of events) {
      const noteEvent = event as NoteEvent
      if (noteEvent.subtype != "note") continue

      const timeAlive =
        this.tickToMillisec(
          noteEvent.tick - player.position,
          player.currentTempo,
        ) / 1000
      const duration = noteEvent.duration
      const angle = velocityToAngle(noteEvent.velocity)
      const zombieType = noteEvent.noteNumber as ZombieType

      if (noteEvent.tick + noteEvent.duration < player.position) continue

      const position: vec2 = positionOfZombie(
        zombieType,
        angle,
        timeAlive,
        duration,
      )

      vec2.add(
        position,
        position,
        vec2.fromValues(canvas.width / 2, canvas.height / 2),
      )

      const [x, y] = position

      ctx.fillRect(x - 5, y - 5, 10, 10)
    }
  }

  render() {
    const { width, height, style, ...props } = this.props
    return (
      <canvas
        ref={(c) => c && (this.canvas = c)}
        {...props}
        width={800}
        height={640}
        style={{ ...style }}
      />
    )
  }
}
