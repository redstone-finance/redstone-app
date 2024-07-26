<template>
    <div class="checkbox-button" @click="toggleCheckbox">
        <img :src="imageSrc" alt="Button Image" class="button-image">
        <span v-if="!isChecked" class="button-text">{{ text }}</span>
        <input v-else type="checkbox" :checked="isChecked" class="checkbox">
        <span class="button-label">{{ label }}</span>
    </div>
</template>

<script>
export default {
    name: 'CheckboxButton',
    props: {
        imageSrc: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            isChecked: false
        }
    },
    methods: {
        toggleCheckbox() {
            this.isChecked = !this.isChecked;
            this.$emit('change', this.isChecked);
        }
    }
}
</script>

<style scoped>
.checkbox-button {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.button-image {
    width: 24px;
    height: 24px;
    margin-right: 8px;
}

.button-text,
.checkbox {
    margin-right: 8px;
}

.button-label {
    font-weight: bold;
}
</style>