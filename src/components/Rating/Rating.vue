<template>
  <div class="star-rating">
    <label
      class="star-rating__star"
      v-for="rating in ratings"
      v-bind:key="rating"
      :class="{
        'is-selected': value >= rating && value != null,
        'is-disabled': disabled,
      }"
      v-on:click="set(rating)"
      v-on:mouseover="starOver(rating)"
      v-on:mouseout="starOut"
    >
      <input
        class="star-rating star-rating__checkbox"
        type="radio"
        :value="rating"
        v-model="value"
        :disabled="disabled"
      />★
    </label>
  </div>
</template>

<script>
  export default {
    name: 'Rating',
    props: {
      value: { type: Number, default: 0 },
      disabled: { type: Boolean },
    },
    data: function () {
      return {
        temp_value: null,
        ratings: [1, 2, 3, 4, 5],
      }
    },

    methods: {
      /*
       * Behaviour of the stars on mouseover.
       */
      starOver(index) {
        if (!this.disabled) {
          this.temp_value = this.value
          return (this.value = index)
        }
      },

      /*
       * Behaviour of the stars on mouseout.
       */
      starOut() {
        if (!this.disabled) {
          return (this.value = this.temp_value)
        }
      },

      /*
       * Set the rating.
       */
      set(value) {
        if (!this.disabled) {
          this.temp_value = value
          return (this.value = value)
        }
      },
    },
  }
</script>

<style src="./Rating.scss" lang="scss" />
