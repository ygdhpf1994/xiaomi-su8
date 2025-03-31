<template>
  <div id="app">
    <button @click="startDrawing">开始画线</button>
    <div ref="pixiContainer" class="canvas-wrapper"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'

const pixiContainer = ref(null)
let app = null
let drawing = false
let line = null
let previewLine = null
let points = []

let viewportContainer = null
let scaleFactor = 1 // 初始缩放比例

onMounted(() => {
  app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0xffffff,
    antialias: true,
  })

  pixiContainer.value.appendChild(app.view)

  // 创建容器，用于缩放内容
  viewportContainer = new PIXI.Container()
  app.stage.addChild(viewportContainer)

  // 滚轮缩放监听
  app.view.addEventListener('wheel', handleWheel, { passive: false })

  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  app.view.removeEventListener('wheel', handleWheel)
})

// 鼠标滚轮缩放内容
const handleWheel = (event) => {
  event.preventDefault()
  const delta = -event.deltaY
  const zoomSpeed = 0.001
  const zoom = 1 + delta * zoomSpeed

  scaleFactor *= zoom
  scaleFactor = Math.max(0.2, Math.min(5, scaleFactor)) // 限制缩放范围

  viewportContainer.scale.set(scaleFactor)
  redrawLines() // 重新画线以匹配线宽
}

// 开始画线
const startDrawing = () => {
  if (!app) return

  drawing = true
  points = []

  line = new PIXI.Graphics()
  viewportContainer.addChild(line)

  previewLine = new PIXI.Graphics()
  viewportContainer.addChild(previewLine)

  app.view.addEventListener('click', drawPoint)
  app.view.addEventListener('mousemove', drawPreviewLine)
}

// 点击确认点
const drawPoint = (event) => {
  if (!drawing) return
  const { x, y } = getMousePos(event)
  points.push({ x, y })
  redrawLines()
}

// 鼠标移动预览线
const drawPreviewLine = (event) => {
  if (!drawing || points.length === 0) return

  const { x, y } = getMousePos(event)
  const last = points[points.length - 1]

  previewLine.clear()
  previewLine.lineStyle(1 / scaleFactor, 0x999999, 0.6)
  previewLine.moveTo(last.x, last.y)
  previewLine.lineTo(x, y)

  app.renderer.render(app.stage)
}

// 重绘固定线段（保持线宽不变）
const redrawLines = () => {
  line.clear()
  line.lineStyle(2 / scaleFactor, 0x000000)

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (i === 0) {
      line.moveTo(p.x, p.y)
    } else {
      line.lineTo(p.x, p.y)
    }
  }

  app.renderer.render(app.stage)
}

// 获取鼠标在容器内的坐标
const getMousePos = (event) => {
  const rect = app.view.getBoundingClientRect()
  const x = (event.clientX - rect.left) / scaleFactor
  const y = (event.clientY - rect.top) / scaleFactor
  return { x, y }
}

// 结束绘图
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && drawing) {
    finishDrawing()
  }
}

const finishDrawing = () => {
  drawing = false
  app.view.removeEventListener('click', drawPoint)
  app.view.removeEventListener('mousemove', drawPreviewLine)
  previewLine?.clear()
  console.log('完成，点集合:', points)
}
</script>

<style>
#app {
  padding: 20px;
}
.canvas-wrapper {
  width: 800px;
  height: 600px;
  border: 1px solid #ccc;
  overflow: hidden;
}
</style>
