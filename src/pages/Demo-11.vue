<template>
    <div>
    <iframe
      :src="iframeUrl"
      width="100%"
      height="600"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const iframeUrl = 'https://www.bocangku.com/part/plugin?swType=CAD&swName=HT&fType=3DModel&theme=light'
const handleMessage = (event) => {
    console.log(event)
    fetch(event.data.url, {headers: {'Authorization': 'Bearer ' + event.data.token}})
}
onMounted(() => {
    window.addEventListener('message', handleMessage)
})
</script>

<style scoped>
.hello {
    /* width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center; */
}
.c {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 100px;
    color: #f5e105;
}
</style>
