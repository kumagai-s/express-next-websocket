import io from "socket.io-client";
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faEraser, faLink, faCaretRight } from '@fortawesome/free-solid-svg-icons'

import { useRoom } from '@/lib/swr-hooks'

export default function IndexPage() {
  const [_socket, _] = useState(() => io())
  const router = useRouter()
  const roomId = router.query.roomId?.toString()
  const { data } = useRoom(roomId)

  const _canvasParent = useRef(null)
  const _canvas = useRef(null)
  const _context = useRef(null)
  const _toolType = useRef('draw')

  useEffect(() => {
    if (!router.isReady) return

    _canvas.current.width = _canvasParent.current.clientWidth
    _canvas.current.height = _canvasParent.current.clientHeight

    let mousedown = (window.ontouchstart === undefined) ? 'mousedown' : 'touchstart',
        mousemove = (window.ontouchmove === undefined) ? 'mousemove' : 'touchmove',
        mouseup = (window.ontouchend === undefined) ? 'mouseup' : 'touchend';
    _canvas.current.addEventListener(mousedown, handleMouseDown);
    _canvas.current.addEventListener(mousemove, handleMouseMove);
    _canvas.current.addEventListener(mouseup, handleMouseUp);
    _canvas.current.addEventListener('mouseleave', e => { isDragging = false });

    _context.current = _canvas.current.getContext("2d")

    return () => {
      _canvas.current.removeEventListener(mousedown, handleMouseDown)
      _canvas.current.removeEventListener(mousemove, handleMouseMove)
      _canvas.current.removeEventListener(mouseup, handleMouseUp)
      _canvas.current.removeEventListener('mouseleave', () => { isDragging = false })
    }
  }, [router.isReady])

  /**
   * Event functions 
   */
  let isDragging = false,
      pointData = [],
      fromX,
      fromY
  
  function scrollX() { return document.documentElement.scrollLeft || document.body.scrollLeft; }
  function scrollY() { return document.documentElement.scrollTop || document.body.scrollTop; }
  function handleMouseDown(e) {
    isDragging = true;

    if (e.type === 'touchstart') {
      fromX = e.touches[0].clientX - _canvas.current.getBoundingClientRect().left + scrollX();
      fromY = e.touches[0].clientY - _canvas.current.getBoundingClientRect().top + scrollY();
    } else {
      fromX = e.offsetX;
      fromY = e.offsetY;
    }
  }

  function handleMouseMove(e) {
    if (!isDragging) return false;

    let toX,
        toY;
    if (e.type === 'touchmove') {
      toX = e.touches[0].clientX - _canvas.current.getBoundingClientRect().left + scrollX();
      toY = e.touches[0].clientY - _canvas.current.getBoundingClientRect().top + scrollY();
    } else {
      toX = e.offsetX;
      toY = e.offsetY;
    }
    if (_toolType.current === 'draw') {
      canvas.draw(fromX, fromY, toX, toY)
    } else if (_toolType.current === 'eraser') {
      canvas.erase(fromX, fromY, toX, toY)
    }
    pointData.push([fromX, fromY, toX, toY])
    fromX = toX;
    fromY = toY;
  }

  function handleMouseUp(e) {
    if (!isDragging) return false;
    isDragging = false;

    _socket.emit("draw", {
      roomId: roomId,
      originWidth: _canvas.current.width,
      pointData: pointData,
      type: _toolType.current,
    })
    pointData = []

    canvas.save()    
  }

  /**
   * Canvas functions 
   */
  const canvas = {
    save: () => {
      let base64 = _canvas.current.toDataURL('image/png')
      const res = fetch('/api/rooms/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: roomId,
          canvasImage: base64.replace(/^.*,/, '')
        }),
      })
    },
    draw: (fromX, fromY, toX, toY, offset = 1) => {
      let fx = fromX * offset,
          fy = fromY * offset,
          tx = toX * offset,
          ty = toY * offset;
      _context.current.beginPath();
      _context.current.moveTo(fx, fy)
      _context.current.lineTo(tx, ty)
      _context.current.stroke()
      _context.current.closePath()
    },
    erase(fx, fy, tx, ty, offset = 1) {
      let prevLineWidth = _context.current.lineWidth
      _context.current.globalCompositeOperation = 'destination-out';
      _context.current.lineWidth = 50
      canvas.draw(fx, fy, tx, ty, offset);
      _context.current.lineWidth = prevLineWidth
      _context.current.globalCompositeOperation = 'source-over';
    },
    clear: () => {
      _context.current.clearRect(0, 0, _canvas.current.width, _canvas.current.height)
    }
  }

  /**
   * Toolbar function
   * @param e 
   */
  function changeToolType(e) {
    let target = e.currentTarget,
        toolbarMenuButton = Array.from(document.getElementsByClassName("tool-bar-menu-button"))
    toolbarMenuButton.forEach(function(element) {
      element.classList.remove('text-white', 'bg-gray-700')
      element.classList.add('text-gray-800', 'hover:bg-gray-100')
    });
    target.classList.remove('text-gray-800', 'hover:bg-gray-100')
    target.classList.add('text-white', 'bg-gray-700')
    _toolType.current = target.id
  }

  function handleClickEraserButton(e) {
    if (_toolType.current === 'eraser') {
      if (window.confirm('クリアしてもよろしいですか？')) { 
        canvas.clear()
        _socket.emit('clear')
        canvas.save()
      }
    }
    changeToolType(e)
  }

  function handleClickCopyLinkButton() {
    let url = location.href
    navigator.clipboard.writeText(url)
    // let notice = document.getElementById('notice')
    // notice.animate([{opacity: '0'}, {opacity: '1'}], 500)
    // notice.style.opacity = 1
    // setTimeout(() => {
    //   notice.animate([{opacity: '1'}, {opacity: '0'}], 500)
    //   notice.style.opacity = 0
    // }, 3000)
  }

  /**
   * Scoket functions
   */
  _socket.emit("join", roomId)

  _socket.on('drawClient', function(data) {
    let offset =  _canvas.current.width / data.originWidth
    data.pointData.forEach(function ([fx, fy, tx, ty], i) {
      setTimeout(function () {
        if (data.type === 'draw') {
          canvas.draw(fx, fy, tx, ty, offset)
        } else if (data.type === 'eraser') {
          canvas.erase(fx, fy, tx, ty, offset)
        }
      }, i * 10);
    })
  })

  _socket.on('clearClient', function() {
    canvas.clear()
  })

  if (data && data.canvas_image) {
    let base64 = 'data:image/png;base64,' + Buffer.from(data.canvas_image).toString("base64")
    let image = new Image()
    image.src = base64
    image.onload = function() {
      _context.current.drawImage(image, 0, 0, _canvas.current.width, _canvas.current.height);
    }
  }

  return (
    <>
      <div className="h-full max-w-[990px] mx-auto">
        <div className="h-full flex items-center">
          <div ref={_canvasParent} className="w-full border-solid border-[1px] bg-unait-map bg-cover aspect-[16/9]">
            <canvas ref={_canvas} />
          </div>
        </div>
      </div>
      <div className="fixed border-solid border-[1px] rounded-[50rem] bg-white w-auto top-[50%] left-[12px] -translate-y-1/2">
          <div className="flex items-center justify-between flex-col">
            <div id="draw" className="tool-bar-menu-button bg-gray-700 text-white m-1 p-3 rounded-[50rem] hover:cursor-pointer hover:bg-gray-100" onClick={changeToolType}>
              <FontAwesomeIcon icon={faPen} size="lg" fixedWidth />
            </div>
            <div id="eraser" className="tool-bar-menu-button relative text-gray-800 m-1 p-3 rounded-[50rem] hover:cursor-pointer hover:bg-gray-100" onClick={handleClickEraserButton}>
              <FontAwesomeIcon icon={faEraser} size="lg" fixedWidth />
              <span className="absolute after:content-['▸']" />
            </div>
            <div className="tool-bar-menu-button text-gray-800 m-1 p-3 rounded-[50rem] hover:cursor-pointer hover:bg-gray-100" onClick={handleClickCopyLinkButton}>
              <FontAwesomeIcon icon={faLink} size="lg" fixedWidth />
            </div>
          </div>
        </div>
    </>
  )
}
