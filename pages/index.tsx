import Container from '@/components/container'
import Router from 'next/router'

export default function IndexPage() {

  async function clickHandler(e) {
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const json = await res.json()
      if (!res.ok) throw Error(json.message)
      Router.push('/rooms/' + json.roomId)
    } catch (e) {
      throw Error(e.message)
    }
  }

  return (
    <div>
      <Container>
        <div onClick={clickHandler}>ルーム作成</div>
      </Container>
    </div>
  )
}
