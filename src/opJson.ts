import { ref } from 'vue';
import type { SearchResult } from './components/searcher';

// export default OpJson;

export type _ClassRegistry = Record<string, ClassDesc>;
export type _ResultsLookup = Record<string, SearchResult[]>;
export type _SeenTracker = Record<string, boolean>;

export const ClassRegistry: _ClassRegistry = {};
export const MemberToClasses: _ResultsLookup = {};
const EnumToClassesSeen: _SeenTracker = {};
export const EnumToClasses: _ResultsLookup = {};
export const EnumValueToClasses: _ResultsLookup = {};
export const NamespaceRegistry: Record<string, _ClassRegistry> = {};
export const AllClassNames = [] as string[];
export const AllClassIDs = [] as string[];
export const AllMemberNames = [] as string[];
export const AllEnumNames = [] as string[];
export const AllEnumValueNames = [] as string[];
export const Versions: {game: string, op: string} = {game: "?", op: "?"};

export const JsonIsLoaded = ref(false);
export const ShowOffsets = ref(true);

// export function JsonIsLoaded() {
//     return _jsonIsLoaded;
// }

const onLoadedCbs: (() => void)[] = [];
export function OnJsonParsedCallback(cb: () => void) {
    if (JsonIsLoaded.value) cb();
    else onLoadedCbs.push(cb);
}


export function ParseDataStructures(opJsonFile: any) {
    if (JsonIsLoaded.value) return;
    Versions.game = opJsonFile['mp'];
    Versions.op = opJsonFile['op'];
    const nss: Record<string, any> = opJsonFile.ns;
    const namespaces = Object.keys(nss);
    namespaces.forEach(nsName => {
        let objsInNs = nss[nsName];
        const classNames = Object.keys(objsInNs);
        classNames.forEach(clsName => {
            let cls = objsInNs[clsName];
            let clsBase = cls['p'];
            let clsCanCreate = cls['c'] == 1;
            let clsMembers = cls['m'] || [];
            let clsId = cls['i'];
            let clsEnums = cls['e'] || [];
            let clsFExt = cls['f'];
            let clsDocs = cls['d'];
            // CheckClassKeys(cls);
            AddClass(nsName, clsName, clsBase, clsCanCreate, clsMembers, clsId, clsEnums, clsFExt, clsDocs);
        })
    })
    // populate base classes
    AllClassNames.forEach(n => {
        let cls = ClassRegistry[n];
        if (cls.base) {
            let clsBase = ClassRegistry[cls.base];
            cls.baseClass = clsBase;
        }
    });

    const AddEnumToIndexes = (cls: ClassDesc, e: EnumDesc) => {
        if (!EnumToClasses[e.nameLower]) {
            EnumToClasses[e.nameLower] = []
        }
        let id = cls.name + "::" + e.name;
        if (EnumToClassesSeen[id]) return;
        EnumToClassesSeen[id] = true;
        EnumToClasses[e.nameLower].push({id, cls, enumName: e.name})
        // console.log(e)
        e.valuesLower.forEach((v, i) => {
            if (!EnumValueToClasses[v]) {
                EnumValueToClasses[v] = []
            }
            EnumValueToClasses[v].push({id: cls.name + "::" + e.name + "::" + e.values[i], cls, enumName: e.name, enumValue: e.values[i]})
        })
    }

    // populate member/enum registries -- do after base class so we can
    AllClassNames.forEach(n => {
        let cls: ClassDesc | null = ClassRegistry[n];
        let origCls = cls;
        while (cls) {
            cls.members.forEach((m) => {
                if (!MemberToClasses[m.nameLower]) {
                    MemberToClasses[m.nameLower] = []
                }
                MemberToClasses[m.nameLower].push({id: origCls.name + "::" + m.name, cls: origCls, member: m})
                if (m.e) AddEnumToIndexes(origCls, m.e)
            })
            cls.enums.forEach(e => AddEnumToIndexes(origCls, e))
            cls = cls.baseClass;
        }
    });

    AllClassNames.sort();

    // finally, add all class IDs to class names
    AllClassIDs.push(...AllClassNames.map(n => ClassRegistry[n].id.toLocaleLowerCase()))

    AllMemberNames.unshift(...Object.keys(MemberToClasses));
    AllMemberNames.sort();
    AllEnumNames.unshift(...Object.keys(EnumToClasses));
    AllEnumNames.sort();
    AllEnumValueNames.unshift(...Object.keys(EnumValueToClasses));
    AllEnumValueNames.sort();

    onLoadedCbs.forEach(f => f())
    JsonIsLoaded.value = true
}


function CheckKeysOf(kind: string, cls: object, ks: string[]) {
    let keys = Object.keys(cls);
    let missed = keys.filter(k => !ks.includes(k));
    if (missed.length > 0) {
        console.warn(`Missed ${kind} keys!!! ${missed}`);
        return false;
    }
    return true;
}

function CheckClassKeys(cls: object) {
    CheckKeysOf('class', cls, ['p', 'c', 'm', 'i', 'e', 'f', 'd']);
}

function CheckEnumKeys(cls: object) {
    return CheckKeysOf('Enum', cls, ['v', 'n']);
}
function CheckDocsKeys(cls: object) {
    CheckKeysOf('Docs', cls, ['d', 'o']);
}



export type ClassDesc = {
    ns: string,
    name: string,
    nameLower: string,
    base: string,
    baseClass: ClassDesc | null,
    instantiable: boolean,
    members: MemberDesc[],
    membersByOffset: MemberDesc[],
    id: string,
    idLower: string,
    enums: EnumDesc[],
    fileExt: string | null,
    docs: string | null,
    nProps: number,
    nFuncs: number,
    nEnums: number,
};

export type MemberDesc = {
    doc: [number, string, number, number] | undefined;
    isConst: boolean,
    offset: number,
    offsetStr: String,
    e?: EnumDesc,
    type: string,
    m: boolean,
    i: number,
    name: string,
    nameLower: string,
    range?: [number, number],
    args?: string,
    returnType: string,
    isFunction: boolean,
    cls: ClassDesc,
    // isProc: boolean,
};

export type EnumDesc = {
    values: string[],
    valuesLower: string[],
    name: string,
    nameLower: string,
};

function AddClass(ns: string, name: string, base: string, instantiable: boolean, clsMembers: object[], id: string, clsEnums: object[], fileExt: string | null, clsDocs: any | null) {
    if (name == "Bool" || name == "Int") return;

    let members: MemberDesc[] = GenClassMembers(clsMembers, clsDocs?.o);
    let enums: EnumDesc[] = GenClassEnums(clsEnums);

    let nEnums = enums.length;
    let nProps = members.filter(m => !m.isFunction).length;
    let nFuncs = members.filter(m => m.isFunction).length;

    let membersByOffset = [...members].sort((c1, c2) => {
        if (c1.offset == c2.offset) return c1.i - c2.i;
        return c1.offset - c2.offset;
    })

    // if (clsDocs) CheckDocsKeys(clsDocs);

    let cls: ClassDesc = {
        ns,
        name,
        base,
        instantiable,
        members,
        id,
        enums,
        fileExt,
        docs: clsDocs?.d,
        nEnums, nProps, nFuncs,
        baseClass: null,
        membersByOffset,
        idLower: id.toLocaleLowerCase(),
        nameLower: name.toLocaleLowerCase(),
    };

    members.forEach(m => m.cls = cls)

    ClassRegistry[name] = cls;
    ClassRegistry[id] = cls;
    ClassRegistry[cls.nameLower] = cls;
    AllClassNames.push(cls.nameLower);

    let nsClss = NamespaceRegistry[ns] || {};
    nsClss[name] = cls;
    nsClss[cls.nameLower] = cls;
    NamespaceRegistry[ns] = nsClss;
}

function GenClassEnums(enums: any[]): EnumDesc[] {
    return enums.map(e => {
        // some enums have namespaces that we don't need or want
            const nameParts: string[] = e.n.split("::")
            const name = nameParts[nameParts.length - 1]
            // (CheckEnumKeys(e) && false) ||
            return ({
            values: e.v,
            valuesLower: e.v.map((v: string) => v.toLocaleLowerCase()),
            name,
            nameLower: name.toLocaleLowerCase()
        })
    })
}

function CheckMemberKeys(cls: object) {
    CheckKeysOf('Member', cls, ['c', 'i', 't', 'r', 'a', 'o', 'e', 'n', 'm']);
}

function GenClassMembers(clsMembers: any[], docs: any[]): MemberDesc[] {
    return clsMembers.map(m => {
        let isConst = m.c == 1;
        let doc = docs?.filter(d => d[0] == m.i)[0];
        let name = m.n;
        let i = m.i;
        let isFunction = typeof(m.t) == "number";
        let returnType = m.r || 'void';
        let args = m.a;
        let type = isFunction ? `${returnType} (${args})` : m.t;
        // let isProc = isFunction && m.t == 1;
        let range = m.r;
        let offset = m.o;
        let offsetStr = m.o < 65535 ? "0x" + m.o.toString(16) : "-";
        let e = m.e && GenClassEnums([m.e])[0];

        if (ShowOffsets.value && typeof(offset) != "number") {
            ShowOffsets.value = false;
        }

        // what is .m??
        // if (m.m != 1 && isFunction) {
        //     console.log(m);
        // }

        // CheckMemberKeys(m);

        return {
            doc, isConst, name, i, type, isFunction, args, returnType, offset, e, m: m.m == 1, range, offsetStr,
            cls: {} as ClassDesc,
            nameLower: name.toLocaleLowerCase(),
        };
    });
}





export function CountClsProps(cls: ClassDesc | null): number {
    if (!cls) return 0;
    return cls.nProps + CountClsProps(cls.baseClass);
}
export function CountClsFuncs(cls: ClassDesc | null): number {
    if (!cls) return 0;
    return cls.nFuncs + CountClsFuncs(cls.baseClass);
}
export function CountClsEnums(cls: ClassDesc | null): number {
    if (!cls) return 0;
    return cls.nEnums + CountClsEnums(cls.baseClass);
}
