<template>
    <div class="layers__details-title">
      <label class="layers__label">Chain</label>
      <strong class="layers__value">{{ chain }}</strong>
      <span class="layers__chain-id">ID: {{ chainId }}</span>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LayerChain',
    props: {
      chain: {
        type: String,
        required: true
      },
      chainId: {
        type: [String, Number],
        required: true
      }
    }
  }
  </script>