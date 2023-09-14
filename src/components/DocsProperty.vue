<script setup lang="ts">
import { onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames, type ClassDesc, type MemberDesc} from "../opJson";

const props = defineProps<{member: MemberDesc}>()

</script>


<template>
    <div v-if="!member.isFunction">
        <div class="flex flex-row items-center pb-0.5">
            <div class="font-mono text-base pr-1 w-12 align-middle text-neutral-300">{{ member.offsetStr }}</div>
            <div v-if="member.isConst" class="bg-yellow-300 text-black text-sm px-1 py-0.5 mr-1">const</div>
            <span class="font-semibold text-orange-400 pr-1">{{ member.type }}</span>
            {{ member.name }}
        </div>
        <div v-if="member.doc" class="ml-2 m-1 rounded bg-gray-600 px-2 pb-0.5 text-base text-neutral-300 italic">
            {{ member.doc[1] }}
            (Flags: {{ member.doc.slice(2) }})
        </div>
    </div>
</template>
