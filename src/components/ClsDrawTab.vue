<script setup lang="ts">
import { onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames, type ClassDesc} from "../opJson";
import DocsSection from './DocsSection.vue'
import DocsProperty from './DocsProperty.vue'
import DocsMethod from './DocsMethod.vue'
import DocsEnum from './DocsEnum.vue'

const props = defineProps<{cls: ClassDesc, isSuper?: boolean}>()

onMounted(() => { console.log('mounted class: ', props) })

function fmtClsName(cls: ClassDesc) {
    let name = cls.name;
    if (props.isSuper) {
        name = "Inherits: " + name;
    }
    return name;
}

</script>


<template>
    <h3 class="text-lg font-semibold">{{ fmtClsName(cls) }}</h3>
    <div class="ml-0">

        <div v-if="cls.docs" class="bg-neutral-700 rounded-md italic p-2 my-2">
            {{ cls.docs  }}
        </div>

        <DocsSection title="Methods" v-if="cls.nFuncs">
            <DocsMethod :member="func" v-for="func in cls.members" />
        </DocsSection>

        <DocsSection title="Properties" v-if="cls.nProps">
            <DocsProperty :member="prop" v-for="prop in cls.members" />
        </DocsSection>

        <DocsSection title="Enums" v-if="cls.nEnums">

        </DocsSection>

    </div>

    <div v-if="cls.baseClass">
        <ClsDrawTab :cls="cls.baseClass" :is-super="true" />
    </div>
</template>
