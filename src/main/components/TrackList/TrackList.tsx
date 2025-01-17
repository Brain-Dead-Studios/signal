import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../../hooks/useStores"
import { BackingTrack } from "./BackingTrack"
import { TrackListItem } from "./TrackListItem"

const List = styled.div`
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.dividerColor};
  min-width: 14rem;
  flex-grow: 1;
`

export const TrackList: FC = observer(() => {
  const { song } = useStores()

  return (
    <List>
      <BackingTrack />
      {song.tracks.map(
        (t, i) => !t.isConductorTrack && <TrackListItem key={i} trackId={i} />,
      )}
      {/* <AddTrackButton /> */}
    </List>
  )
})
