<template>
    <div class="layers">
        <div class="layer__details-title">
            <h4>{{ layerId }}</h4>
        </div>
        <div class="layers__details-title">
            <label class="layers__label">Chain</label>
            <strong class="layers__value">{{ layer.chain.name }}</strong>
            <span class="layers__chain-id">ID: {{ layer.chain.id }}</span>
        </div>
        <div class="layers__details-title">
            <label class="layers__label">Price feeds</label>
            <span class="layers__value d-block" v-for="(value, name, index) in layer.priceFeeds" :key="index">{{ name
                }}:{{ value }}</span>
        </div>
    </div>
</template>

<script>
import { isEmpty } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
    components: {
    },
    data() {
        return {

        };
    },

    async mounted() {
        if (isEmpty(this.layersSchema)) {
            this.initSingleContract(this.$route.params.layerId)
        }
    },
    methods: {
        ...mapActions('layers', ['initSingleContract']),
        ...mapActions('layout', ['updateSearchTerm'])
    },

    computed: {
        layerId() {
            return this.$route.params.layerId
        },
        ...mapState('layers', ['layersDetails', 'layersSchema']),
        ...mapGetters('layers', [
            'combinedLayersWithDetailsArray'
        ]),
        layer() {
            return this.layersSchema[this.layerId]
        }
    }
}
</script>