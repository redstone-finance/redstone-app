<template>
    <b-form-checkbox :disabled="disabled" class="crypto-checkbox" variant="danger" :checked="isChecked"
        @change="toggleCheckbox">
        <b-img :title="name" :src="getImageUrl(imageName)" :alt="name" width="20" height="20" class="mr-1" />
        <span :title="name">{{ name }}</span>
    </b-form-checkbox>
</template>

<script>
export default {
    name: 'CheckboxButton',
    props: {
        name: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        imageName: {
            type: String,
            required: true,
        },
        isChecked: {
            type: Boolean,
            required: true,
        },
        disabled: {
            type: Boolean,
            required: false,
        }
    },
    methods: {
        toggleCheckbox() {
            this.$emit('change', { value: this.token, isChecked: this.isChecked });
        },
        getImageUrl(imageName) {
            return `/logos/${imageName}`
        },
    }
}
</script>

<style lang="scss">
.crypto-checkbox {
    margin: 0 5px 0;
    padding: 0 !important;

    input:checked+label {
        border: 2px solid var(--redstone-red-color);
    }

    label {
        line-height: 25px;
        cursor: pointer;
        padding: 5px 10px;
        margin: 0 !important;
        border-radius: 30px;
        background: #fcfcfc;
        border: 2px solid #ececec;

        &::before,
        &::after {
            display: none !important;
        }
    }
}
</style>