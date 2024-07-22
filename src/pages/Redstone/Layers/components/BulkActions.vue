<template>
    <div class="layers__actions-wrapper-item">
      <div class="layers__actions-wrapper-label">Bulk actions:</div>
      <b-dropdown split :disabled="selectedItemsCount < 1" id="dropdown-left" size="sm"
        :text="`${selectedItemsCount} item(s)`" variant="danger" class="layers__actions-wrapper-dropdown"
        split-variant="outline-danger">
        <b-dropdown-item>
          <div class="copy-section mb-2">Copy</div>
          <div class="mb-2">
            <b-button size="sm" variant="outline-danger" @click="$emit('copy-trigger-conditions')">trigger conditions</b-button>
            <b-button size="sm" class="ml-2" variant="outline-danger" @click="$emit('copy-price-feeds')">price feeds</b-button>
          </div>
          <div>
            <b-button size="sm" variant="outline-danger" @click="$emit('copy-contract-address')">contract address</b-button>
            <b-button size="sm" class="ml-2" variant="outline-danger" @click="$emit('copy-chain-details')">chain details</b-button>
          </div>
        </b-dropdown-item>
        <b-dropdown-item>
          <b-button block variant="danger" @click="$emit('copy-full-definition')">
            <strong>
              Full definition
            </strong>
          </b-button>
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BulkActionsDropdown',
    props: {
      selectedItemsCount: {
        type: Number,
        required: true
      }
    },
    emits: [
      'copy-trigger-conditions',
      'copy-price-feeds',
      'copy-contract-address',
      'copy-chain-details',
      'copy-full-definition'
    ]
  }
  </script>
