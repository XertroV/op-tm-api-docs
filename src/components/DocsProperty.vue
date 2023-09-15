<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames, type ClassDesc, type MemberDesc, type EnumDesc, ShowOffsets} from "../opJson";
import TypeName from "./TypeName.vue"

const props = defineProps<{cls: ClassDesc, member?: MemberDesc, enumDesc?: EnumDesc, showFuncs?: boolean, showProps?: boolean}>()

const collapsed = ref(props.enumDesc && props.enumDesc.values.length > 4);
const collapsedSign = computed(() => collapsed.value ? "(+)" : "(-)");

function toggleCollapse() {
    collapsed.value = !collapsed.value;
}
</script>


<template>
    <div v-if="member">
        <div v-if="(showFuncs && member.isFunction) || (showProps && !member.isFunction)">
            <div class="pb-0.5">
                <span v-if="ShowOffsets" class="font-mono text-base pr-1 min-w-[3rem] inline-block align-middle text-neutral-300 align-[1px]">{{ member.offsetStr }}</span>
                <span v-if="member.isConst" class="bg-yellow-300 text-black text-sm px-1 py-0.5 align-[2px]">const</span>
                <span v-if="member.isConst">&nbsp;</span>
                <span v-if="member.m">
                    <span class="bg-green-300 text-black text-sm px-1 py-0.5 align-[2px]" title="What does M mean? IDK but it's a bool">M</span>&nbsp;
                </span>
                <span class="doc-property-type">
                    <TypeName v-if="member.isFunction" :t="member.returnType" />
                    <TypeName v-else :t="member.type" />
                </span>
                <span>&nbsp;{{ member.name }}<span v-if="member.isFunction">({{ member.args }})</span>
                </span>
            </div>
            <div v-if="member.doc" class="ml-2 m-1 rounded bg-gray-600 px-2 pb-0.5 text-neutral-300 italic">
                <div v-html="member.doc[1]" class="inline-block"></div>
                (Flags: {{ member.doc.slice(2) }})
            </div>
            <DocsProperty :cls="cls" v-if="member.e" :enum-desc="member.e" />
        </div>
    </div>
    <div v-else-if="enumDesc">
        <div class="ml-2 m-1 rounded bg-gray-600 px-2 pb-0.5 text-base text-neutral-200">
            <div class="text-lg cursor-pointer select-none" @click="toggleCollapse()">{{ enumDesc.name }} <span class="text-neutral-400 font-bold font-mono">{{ collapsedSign }}</span></div>
            <div v-if="!collapsed" v-for="vname, index in enumDesc.values">
                <span class="w-6 font-mono inline-block">{{ index }}</span>
                <span class="text-neutral-400 inline-block">{{ cls.name }}::{{ enumDesc.name }}::</span>{{ vname }}
            </div>
        </div>
    </div>
    <div v-else>
        ?? Neither member nor enum ??
    </div>
</template>

<style>
.doc-property-type {
    @apply font-semibold text-orange-400;
}
</style>
