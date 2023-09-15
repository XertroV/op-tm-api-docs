<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames, type ClassDesc} from "../opJson";
import DocsSection from './DocsSection.vue'
import DocsProperty from './DocsProperty.vue'

import { useRouter, useRoute } from 'vue-router'
const router = useRouter(); const route = useRoute();

const props = defineProps<{cls?: ClassDesc, isSuper?: boolean}>()

function fmtClsName(cls: ClassDesc | null) {
    if (!cls) return `Class not found: ${route.params.name || '(No class name provided)'}`
    let name = `${cls.ns}::${cls.name}`;
    if (props.isSuper) {
        name = "Inherits: " + name;
    }
    return name;
}

const theCls = computed(() => props.cls || (route.params.name ? ClassRegistry[route.params.name as string] : null))

const instantiableCss = computed(() => theCls.value?.instantiable ? "bg-lime-700" : "bg-red-800")

</script>


<template>
    <h3 class="text-xl font-semibold mb-2">{{ fmtClsName(theCls) }}</h3>
    <div class="ml-0" v-if="theCls">
        <!-- Status row for class: id, instantiable, etc -->
        <div v-if="true || !isSuper" class="flex flex-row gap-2 text-base mb-3">
            <div class="bg-neutral-700 text-stone-200 font-mono px-2 text-center">0x{{ theCls.id }}</div>
            <div class="text-stone-200 px-2 text-center font-mono" :class="instantiableCss">{{ theCls.instantiable ? 'Instantiable' : 'Uninstantiable' }}</div>
        </div>

        <div v-if="theCls.docs" class="bg-neutral-700 rounded-md italic p-2 my-2">
            {{ theCls.docs  }}
        </div>

        <DocsSection title="Methods" v-if="theCls.nFuncs" :key="theCls.name + '-methods'">
            <DocsProperty :cls="theCls" :member="func" :show-funcs="true" v-for="func in theCls.members" />
        </DocsSection>

        <DocsSection title="Properties" v-if="theCls.nProps" :key="theCls.name + '-props'">
            <DocsProperty :cls="theCls" :member="prop" :show-props="true" v-for="prop in theCls.members" />
        </DocsSection>

        <DocsSection title="Enums" v-if="theCls.nEnums" :key="theCls.name + '-enums'">
            <DocsProperty :cls="theCls" :enum-desc="_enum" :show-enums="true" v-for="_enum in theCls.enums" />
        </DocsSection>

    </div>

    <div v-if="theCls?.baseClass">
        <ClsDrawTab :cls="theCls.baseClass" :is-super="true" />
    </div>
</template>

<style scoped>
.scroller {
  height: calc(100vh - 10rem);
}
</style>
