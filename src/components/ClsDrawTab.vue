<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames, type ClassDesc, ShowOffsets} from "../opJson";
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
    // name += `  ( Bytes)`;
    return name;
}

const theCls = computed(() => props.cls || (route.params.name ? ClassRegistry[route.params.name as string] : null))

const instantiableCss = computed(() => theCls.value?.instantiable ? "bg-lime-700" : "bg-red-800")

// for Inherited By
const ibCollapsed = ref((theCls?.value?.superClasses.length || 0) > 4);
const ibCollapsedSign = computed(() => ibCollapsed.value ? "(+)" : "(-)");

function toggleIbCollapse() {
    ibCollapsed.value = !ibCollapsed.value;
}


</script>


<template>
    <h3 v-if="isSuper" class="text-xl font-semibold mb-2">{{ fmtClsName(theCls) }}</h3>
    <div v-else class="mb-0.5">
        <div class="ml-2 m-1 rounded bg-gray-600 px-2 pb-0.5 text-base text-neutral-200">
            <div class="text-lg cursor-pointer select-none" @click="toggleIbCollapse()">Inherited By {{ theCls?.superClasses.length }} classes <span class="text-neutral-400 font-bold font-mono">{{ ibCollapsedSign }}</span></div>
                <div v-if="!ibCollapsed" v-for="cls in theCls?.superClasses" :key="cls.name" class="ml-1 doc-property-type inline-block mr-1">
                    <router-link :to="'/' + cls.name">{{ cls.name }}</router-link>
                </div>
                <div v-if="!ibCollapsed" class="mb-1"></div>
                <!-- <span class="w-6 font-mono inline-block">{{ index }}</span>
                <span class="text-neutral-400 inline-block">{{ cls.name }}::{{ enumDesc.name }}::</span>{{ vname }} -->
            </div>
        </div>

    <div class="ml-0" v-if="theCls">
        <!-- Status row for class: id, instantiable, etc -->
        <div v-if="true || !isSuper" class="flex flex-row gap-2 text-base mb-3">
            <div class="bg-neutral-700 text-stone-200 font-mono px-2 text-center">0x{{ theCls.id }}</div>
            <div class="text-stone-200 px-2 text-center font-mono" :class="instantiableCss">{{ theCls.instantiable ? 'Instantiable' : 'Uninstantiable' }}</div>
            <div v-if="ShowOffsets" class="text-base font-mono inline-block align-middle align-[1px]">Size (B): <span>{{ theCls?.sizeStr }}</span> = {{ theCls?.size }}</div>
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
