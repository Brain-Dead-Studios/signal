import styled from "@emotion/styled"
import Add from "mdi-react/AddIcon"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { Localized } from "../../../components/Localized"
import { openBackingTrack } from "../../actions/file"
import { useStores } from "../../hooks/useStores"

const Wrapper = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.secondaryTextColor};
  border-radius: 0.5rem;
  margin: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
`

const AddIcon = styled(Add)`
  min-width: auto;
  margin-right: 0.5em;
  color: inherit;
`

const Label = styled.div`
  font-size: 0.875rem;
`

export const BackingTrack: FC = observer(() => {
  const rootStore = useStores()

  const song = rootStore.song

  const onClick = useCallback(() => {
    if (song.backingTrack == null) {
      openBackingTrack(rootStore);
    }else{
      song.backingTrack = null;
    }
  }, [])

  return (
    <Wrapper onClick={onClick}>
      <AddIcon />
      <Label>
        {
          song.backingTrack != null ?
          <Localized default="Remove Backing Track">remove-backing-track</Localized> :  
          <Localized default="Add Backing Track">add-backing-track</Localized>
        }
      </Label>
    </Wrapper>
  )
})
