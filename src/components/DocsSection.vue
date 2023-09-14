<script setup lang="ts">
import { onMounted, ref } from "vue";
import {ClassRegistry, AllClassNames, type ClassDesc} from "../opJson";

const props = defineProps<{title: string}>()

</script>


<template>
    <div class="bg-sky-800 text-white font-bold rounded-t-md px-2 py-1 mt-2">
        {{ title }}
    </div>
    <div class="bg-sky-950 text-white rounded-b-md px-2 py-1 mb-2">
        <slot></slot>
    </div>
</template>
