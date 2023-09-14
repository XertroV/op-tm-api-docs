<script setup lang="ts">
import { onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames} from "../opJson";

import ClsResult from './ClsResult.vue';

// defineProps<{}>()

const currSearch = ref("");
const searchResults = ref([] as string[]);


function matchQuery(name: string, query: string) {
    let np = 0;
    let qp = 0;
    while (qp < query.length && np < name.length) {
        if (query[qp] == name[np]) {
            qp++;
            if (qp == query.length) break;
        }
        np++;
    }
    return np < name.length && qp <= query.length;
}


function UpdateResults() {
    const query = currSearch.value.toLocaleLowerCase();
    console.log("query: ", query)
    const resultsList: string[] = [];
    const results: Record<string, any> = {};
    const classNames = AllClassNames;
    const addToResults = (n: string) => {
        results[n] = true;
        resultsList.push(n);
    }
    classNames.filter(n => n.startsWith(query)).forEach(addToResults);
    classNames.filter(n => !results[n] && n.includes(query)).forEach(addToResults);
    classNames.filter(n => !results[n] && matchQuery(n, query)).forEach(addToResults);
    searchResults.value = resultsList;
}

onMounted(() => {
    UpdateResults();
})

</script>


<template>
    <div class="p-1">
        <input v-model="currSearch" @input="UpdateResults" placeholder="Search for a class" class="py-1 px-2 text-white bg-black w-1/2 rounded" />
    </div>

    <div id="results-list" class="p-1 text-left flex flex-col max-h-100 overflow-y-auto">
        <ClsResult :cls="ClassRegistry[clsRes]" v-for="clsRes in searchResults" />
    </div>
</template>
