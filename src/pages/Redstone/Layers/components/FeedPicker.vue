<template>
    <div class="d-flex items-center mt-4">
        <b-dropdown class="dropdown" variant="outline-danger" size="sm" id="dropdown-1" text="Filter by crypto"
            multiple>
            <b-dropdown-form>
                <b-form-checkbox-group class="crypto-checkbox-group" v-model="selectedCryptos" stacked>
                    <b-form-checkbox class="crypto-checkbox" variant="danger" v-for="crypto in cryptoImageData"
                        :key="crypto.token" :value="crypto.token">
                        <b-img :src="getImageUrl(crypto.imageName)" :alt="crypto.name" width="20" height="20"
                            class="mr-1" />
                        {{ crypto.name }}
                    </b-form-checkbox>
                </b-form-checkbox-group>
            </b-dropdown-form>
        </b-dropdown>

        <div class="ml-2 selected-cryptos" v-if="selectedCryptos.length">
            <b-img @click="uncheck(token)" :key="token" v-for="token in selectedCryptos" :src="getImageUrl(getCryptoByToken(token).imageName)"
                :alt="getCryptoByToken(token).name" width="20" height="20" class="mr-2" />
        </div>
    </div>
</template>

<script>
import { BDropdown, BDropdownForm, BFormCheckboxGroup, BFormCheckbox, BImg, BCard, BListGroup, BListGroupItem } from 'bootstrap-vue'
import images from '@/core/logosDefinitions.js'

export default {
    name: 'CryptoMultiselectDropdown',
    components: {
        BDropdown,
        BDropdownForm,
        BFormCheckboxGroup,
        BFormCheckbox,
        BImg,
        BCard,
        BListGroup,
        BListGroupItem
    },
    data() {
        return {
            cryptoImageData: images,
            selectedCryptos: []
        }
    },
    methods: {
        uncheck(token){
            this.selectedCryptos = this.selectedCryptos.filter(crypto => crypto != token)
        },
        getImageUrl(imageName) {
            return `/logos/${imageName}`;
        },
        getCryptoByToken(token) {
            return this.cryptoImageData.find(crypto => crypto.token === token) || { name: token, imageName: '' };
        }
    }
}
</script>

<style lang="scss">

.selected-cryptos{
    background: #fff;
    border-radius: 15px;
    box-shadow: var(--table-shadow);
    border: 1px solid #dedede;
    padding: 6px 10px;
    img{
        cursor: not-allowed;
    }
}
.crypto-checkbox-group {
    display: flex;
    flex-flow: row wrap;
}

.dropdown {
    button {
        padding: 6px 10px;
        font-size: 12px;
        background: #fff;

        &:hover {
            background: #fff;
            color: var(--redstone-red-color)
        }
    }

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