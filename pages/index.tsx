import Nav from '@/components/nav'
import Container from '@/components/container'
import Entries from '@/components/entries'

import { useEntries } from '@/lib/swr-hooks'

export default function IndexPage() {
  const { entries, isLoading } = useEntries()

  return (
    <div>
      <Container>
        <Entries entries={entries} />
      </Container>
    </div>
  )
}
