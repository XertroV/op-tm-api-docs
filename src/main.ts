import './assets/main.css'
import './index.css'

import { createApp } from 'vue'
import App from './App.vue'
import { ParseDataStructures } from './opJson';
import {emitter} from '@/emitter';

const app = createApp(App)
app.config.globalProperties.emitter = emitter;
app.mount('#app')
setTimeout(ParseDataStructures, 0);
