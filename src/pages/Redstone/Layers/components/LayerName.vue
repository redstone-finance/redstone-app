<template>
    <div class="layers__details-title layers__details-title--featured">
      <label class="layers__label">Layer name</label>
      <strong class="layers__value">{{ layerName }}</strong>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LayerName',
    props: {
      layerName: {
        type: String,
        required: true
      }
    }
  }
  </script>