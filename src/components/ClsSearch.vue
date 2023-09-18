<script setup lang="ts">
import { onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames, type MemberDesc, type ClassDesc, type EnumDesc, AllMemberNames, MemberToClasses, AllEnumNames, EnumToClasses, AllEnumValueNames} from "../opJson";

import ClsResult from './ClsResult.vue';
import { EnumValueToClasses } from "../opJson";
import {UpdateResults, searchResults, searchOptions} from './searcher';

// defineProps<{}>()

const beenMounted = ref(false);

onMounted(() => {
    if (!beenMounted.value) {
        beenMounted.value = true;
        UpdateResults();
    }
})

function ToggleSearchOptAndUpdateSoon(optName: keyof (typeof searchOptions)) {
    searchOptions[optName] = !searchOptions[optName]
    UpdateSoon()
}

function UpdateSoon() {
    setTimeout(UpdateResults, 1);
}

</script>


<template>
    <div id="results-list" class="text-left m-0">
        <!-- search options -->
        <div class="flex flex-row items-center gap-2">
            <div v-for="optVal, optName in searchOptions" class="">
                <label :for="'so-' + optName" class="pr-1 select-none" @click="ToggleSearchOptAndUpdateSoon(optName)">{{ optName }}
                    <input type="checkbox" :id="'so-' + optName" @input="UpdateSoon" v-model="searchOptions[optName]" />
                </label>
            </div>
        </div>

        <!-- main results list; don't use lazy scroller when we have < 100 results. -->
        <div v-if="searchResults.length < 100" class="">
            <ClsResult :res="clsRes" v-for="clsRes in searchResults" />
        </div>

        <!-- :item-size="32" -->
        <!-- key-field="id" -->
        <!--  -->
        <RecycleScroller
            v-else
            class="scroller"
            :items="searchResults"
            :item-size="30"
            :buffer="1000"
            v-slot="{item, index, active}">
                <ClsResult :res="item" />
        </RecycleScroller>
    </div>
</template>

<style scoped>
.scroller {
  height: calc(100vh - 12rem);
  /* height: 100%; */
  /* max-height: 100%; */
}

/* .user {
  height: 32%;
  padding: 0 12px;
  display: flex;
  align-items: center;
} */
</style>
