<template>
    <b-form-checkbox class="crypto-checkbox" variant="danger" v-for="crypto in cryptoImageData" :key="crypto.token"
        :value="crypto.token">
        <b-img :title="crypto.name" :src="getImageUrl(crypto.imageName)" :alt="crypto.name" width="20" height="20"
            class="mr-1" />
        <span :title="crypto.name">{{ crypto.token }}</span>
    </b-form-checkbox>
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

<style scoped lang="scss">
.crypto-checkbox-group {
    display: flex;
    flex-flow: row wrap;
}

.dropdown.show {
    button {
        background: var(--redstone-red-color) !important;
        border: 2px solid darken(#FD627A, $amount: 15) !important;
    }
}

.dropdown {
    margin: 0 !important;

    ul {
        min-width: 250px;
    }

    button {
        padding: 10px 18px;
        font-size: 14px;
        background: #fff;
        border: 2px solid #e4e4e4;

        &:hover {
            background: #fff;
            color: #1a1414;
        }
    }
}

.crypto-dropdown {
    position: static !important;

    ul {
        width: 100%;
        left: 0;
        top: 100% !important;
        transform: none !important;
    }
}

.crypto-checkbox {
    margin: 10px !important;
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