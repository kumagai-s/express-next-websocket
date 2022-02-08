import Container from '@/components/container'
import Footer from '@/components/footer'
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
    <div className="overflow-hidden max-w-[990px] mx-auto">
      <div className='py-5 text-center'>
        <div className='mb-6'>
          <h1 className='text-3xl'>
            ポケモンユナイト<br className='sm:hidden' />作戦会議室
          </h1>
        </div>
        <div className='mb-6'>
          <div className='mb-6'>
            <div className='inline-block text-left'>
              <div className='mb-3'>
                <h2 className='text-xl'>使い方</h2>
              </div>
              <ol className='list-decimal list-inside'>
                <li>ルーム作成をクリック</li>
                <li>リンクをコピーして共有</li>
                <li>描いた内容を共有できます</li>
              </ol>
            </div>
          </div>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={clickHandler}>
              ルーム作成
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
