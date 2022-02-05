export class Canvas {
  constructor() {
    this.element = document.getElementById('canvas');
    this.context = this.element.getContext('2d');
  }

  setLineWidth(width) {
    this.context.lineWidth = width;
  }

  setImage(src) {

    let image = new Image();
    image.src = src;
    image.onload = handleOnload(this.element, this.context);

    function handleOnload(elm, ctx) {
      return function () {
        ctx.drawImage(image, 0, 0, elm.width, elm.height);
      }
    }
  }

  getImage() {
    return this.element.toDataURL('image/png');
  }

  resize(w, h) {
    this.element.width = w;
    this.element.height = h;
  }

  clear() {
    this.context.clearRect(
      0,
      0,
      this.element.width,
      this.element.height
    );
  }

  draw(fx, fy, tx, ty, offset = 1) {
    let fromX = fx * offset,
      fromY = fy * offset,
      toX = tx * offset,
      toY = ty * offset;
    this.context.beginPath();
    this.context.moveTo(fromX, fromY);
    this.context.lineTo(toX, toY);
    this.context.stroke();
    this.context.closePath();
  }

  erase(fx, fy, tx, ty, offset = 1) {
    let prevLineWidth = this.context.lineWidth;
    this.context.globalCompositeOperation = 'destination-out';
    this.setLineWidth(50);
    this.draw(fx, fy, tx, ty, offset);
    this.setLineWidth(prevLineWidth);
    this.context.globalCompositeOperation = 'source-over';
  }
}
