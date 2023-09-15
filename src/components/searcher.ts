import { ref } from "vue";
import {ClassRegistry, AllClassNames, type MemberDesc, type ClassDesc, type EnumDesc, AllMemberNames, MemberToClasses, AllEnumNames, EnumToClasses, AllEnumValueNames, AllClassIDs} from "../opJson";
import { EnumValueToClasses, OnJsonParsedCallback } from "../opJson";

export const currSearch = ref("");
export type SearchResult = {
    id: string,
    cls: ClassDesc,
    member?: MemberDesc,
    enumName?: string,
    enumValue?: string,
}
export const searchResults = ref([] as SearchResult[]);


OnJsonParsedCallback(() => {
    searchResults.value = [
        ...AllClassNames.map(n => ({id: n, cls: ClassRegistry[n]})),
        ...AllMemberNames.map(n => MemberToClasses[n]).flat(),
        ...AllEnumNames.map(n => EnumToClasses[n]).flat(),
        ...AllEnumValueNames.map(n => EnumValueToClasses[n]).flat(),
    ]
})


function matchQuery(name: string, qParts: string[]) {
    if (qParts.length == 0) return true;
    let np = 0;
    let qp = 0;
    while (qp < qParts.length && np < name.length) {
        let partLen = qParts[qp].length;
        if (matchName(name, np, qParts[qp])) {
            qp++;
            // break if fully matched
            if (qp == qParts.length) break;
            np += partLen;
        } else {
            np++;
        }
    }
    return np < name.length && qp <= qParts.length;
}

function matchName(name: string, np: number, qPart: string): boolean {
    if (qPart.length == 0) return true;
    if (name.length - np < qPart.length) return false;
    if (!name.startsWith(qPart, np)) return false;
    return true;
}

let lastSleep = 0;

async function checkSleep(ms: number): Promise<boolean> {
    if (Date.now() - lastSleep > 20) {
        lastSleep = Date.now();
        await new Promise(r => setTimeout(r, ms))
        return true;
    }
    return false;
}

let updateNonce = 0;
export const regexInvalid = ref(false);

export async function UpdateResults() {
    let myUpdateNonce = ++updateNonce;
    let query = currSearch.value.toLocaleLowerCase();
    // console.log("query: ", query)
    const resultsLists: SearchResult[][] = [[], [], []];
    const results: Record<string, any> = {};
    let hasWildcards = query.includes("*");
    let hasRegex = query.startsWith('/');
    while (query.startsWith("*")) {
        query = query.substring(1);
    }
    let qParts: string[] = [];
    let qRegex: RegExp | null = null;
    if (regexInvalid.value) regexInvalid.value = false;
    if (hasRegex) {
        let [exp, flags] = query.substring(1).split('/', 2);
        try {
            qRegex = new RegExp(exp, flags)
        } catch {
            regexInvalid.value = true;
            return;
        }
    }
    if (hasWildcards) {
        qParts = query.trim().split("*").filter(p => p.length > 0);
    }

    for (let i = 0; i < AllClassNames.length; i++) {
        let n = AllClassNames[i];
        let cls = ClassRegistry[n];
        if (qRegex && (qRegex.exec(n)?.length || qRegex.exec(cls.idLower)?.length)) {
            resultsLists[0].push({id: n, cls});
        } else if (!hasWildcards && (n.startsWith(query) || cls.idLower.startsWith(query))) {
            resultsLists[0].push({id: n, cls});
        } else if (!hasWildcards && (n.includes(query) || cls.idLower.includes(query))) {
            resultsLists[1].push({id: n, cls});
        } else if (hasWildcards && (matchQuery(n, qParts) || matchQuery(cls.idLower, qParts))) {
            resultsLists[2].push({id: n, cls});
        }
        if (await checkSleep(1) && myUpdateNonce != updateNonce) return;
    }

    for (let i = 0; i < AllMemberNames.length; i++) {
        let n = AllMemberNames[i];
        if (qRegex && (qRegex.exec(n)?.length)) {
            resultsLists[0].push(...(MemberToClasses[n] || []));
        } else if (!hasWildcards && n.startsWith(query)) {
            resultsLists[0].push(...(MemberToClasses[n] || []));
        } else if (!hasWildcards && n.includes(query)) {
            resultsLists[1].push(...(MemberToClasses[n] || []));
        } else if (hasWildcards && matchQuery(n, qParts)) {
            resultsLists[2].push(...(MemberToClasses[n] || []));
        }
        if (await checkSleep(1) && myUpdateNonce != updateNonce) return;
    }
    if (await checkSleep(1) && myUpdateNonce != updateNonce) return;
    for (let i = 0; i < AllEnumNames.length; i++) {
        let n = AllEnumNames[i];
        if (qRegex && (qRegex.exec(n)?.length)) {
            resultsLists[0].push(...(EnumToClasses[n] || []));
        } else if (!hasWildcards && n.startsWith(query)) {
            resultsLists[0].push(...(EnumToClasses[n] || []));
        } else if (!hasWildcards && n.includes(query)) {
            resultsLists[1].push(...(EnumToClasses[n] || []));
        } else if (hasWildcards && matchQuery(n, qParts)) {
            resultsLists[2].push(...(EnumToClasses[n] || []));
        }
        if (await checkSleep(1) && myUpdateNonce != updateNonce) return;
    }
    if (await checkSleep(1) && myUpdateNonce != updateNonce) return;
    for (let i = 0; i < AllEnumValueNames.length; i++) {
        let n = AllEnumValueNames[i];
        if (qRegex && (qRegex.exec(n)?.length)) {
            resultsLists[0].push(...(EnumValueToClasses[n] || []));
        } else if (!hasWildcards && n.startsWith(query)) {
            resultsLists[0].push(...(EnumValueToClasses[n] || []));
        } else if (!hasWildcards && n.includes(query)) {
            resultsLists[1].push(...(EnumValueToClasses[n] || []));
        } else if (hasWildcards && matchQuery(n, qParts)) {
            resultsLists[2].push(...(EnumValueToClasses[n] || []));
        }
        if (await checkSleep(1) && myUpdateNonce != updateNonce) return;
    }
    if (await checkSleep(1) && myUpdateNonce != updateNonce) return;
    searchResults.value = resultsLists.flat();
}
