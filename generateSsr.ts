import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import OpJsonNext from '@/OpenplanetNext.json';
import OpJson4 from '@/Openplanet4.json';
import OpJsonTurbo from '@/OpenplanetTurbo.json';

import { setupApp } from "@/main"


const genPage = (html: string) => {
    `
<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TMNext: Advanced Docs</title>
    <script type="module" src="/client.js"></script>
    </head>
    <body>
    <div id="app" class="">${html}</div>
    </body>
</html>

    `
}


const nextApp = setupApp('next', OpJsonNext, true) //, createSSRApp)
const mp4App = setupApp('mp4', OpJson4, true) //, createSSRApp)
const turboApp = setupApp('turbo', OpJsonTurbo, true) //, createSSRApp)
