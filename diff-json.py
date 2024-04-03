from dataclasses import dataclass
import json

# Define a dataclass to store differences
@dataclass
class Difference:
    path: str
    value1: any
    value2: any

# structure:
# { ns: { [Name]: { [Type] : { i: str, m: [ { n: str, ..props } ], ..props } } }


def compare_versions(v1: dict, v2: dict):
    ns1 = v1['ns']
    ns2 = v2['ns']
    differences = []
    for ns in ns1.keys() | ns2.keys():
        if ns not in ns1:
            differences.append(Difference(f"ns/{ns}", None, ns2[ns]))
        elif ns not in ns2:
            differences.append(Difference(f"ns/{ns}", ns1[ns], None))
        else:
            differences.extend(compare_ns(ns1[ns], ns2[ns], ns))
    return differences

def compare_ns(ns1: dict, ns2: dict, ns):
    path = f"{ns}"
    differences = []
    for ty_name in ns1.keys() | ns2.keys():
        if ty_name not in ns1:
            differences.append(Difference(f"{path}/{ty_name}", None, ns2[ty_name]))
        elif ty_name not in ns2:
            differences.append(Difference(f"{path}/{ty_name}", ns1[ty_name], None))
        else:
            differences.extend(compare_type(ns1[ty_name], ns2[ty_name], f"{path}/{ty_name}"))
    return differences


def print_args_on_exception(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"Error in {func.__name__} with args: {args} and kwargs: {kwargs}")
            raise e
    return wrapper


@print_args_on_exception
def compare_type(ty1: dict, ty2: dict, path):
    # if not isinstance(ty1, dict) or not isinstance(ty2, dict):
    #     raise Exception("Not a dict")
    differences = []
    for prop in ty1.keys() | ty2.keys():
        if prop not in ty1:
            differences.append(Difference(f"{path}/{prop}", None, ty2[prop]))
        elif prop not in ty2:
            differences.append(Difference(f"{path}/{prop}", ty1[prop], None))
        elif isinstance(ty1[prop], dict) and isinstance(ty2[prop], dict):
            # raise Exception("dict in type")
            # differences.extend(compare_enum(ty1[prop], ty2[prop], f"{path}/{prop}"))
            differences.extend(compare_json(ty1[prop], ty2[prop], f"{path}/{prop}"))
        elif isinstance(ty1[prop], list) and isinstance(ty2[prop], list):
            # members might not be in the same order
            ms1: list[dict] = ty1[prop]
            ms2: list[dict] = ty2[prop]
            get_key = lambda x: x['n'] if isinstance(x, dict) else x
            ms1.sort(key=get_key)
            ms2.sort(key=get_key)
            m1i = 0
            m2i = 0
            to_cmp = get_key
            while m1i < len(ms1) and m2i < len(ms2):
                m1 = ms1[m1i]
                m2 = ms2[m2i]
                if to_cmp(m1) == to_cmp(m2):
                    differences.extend(compare_json(m1, m2, f"{path}/{prop}[{get_key(m2)}]"))
                    m1i += 1
                    m2i += 1
                elif to_cmp(m1) < to_cmp(m2):
                    differences.append(Difference(f"{path}/{prop}[{get_key(m1)}]", m1, None))
                    m1i += 1
                else:
                    differences.append(Difference(f"{path}/{prop}[{get_key(m2)}]", None, m2))
                    m2i += 1
        elif ty1[prop] != ty2[prop]:
            differences.append(Difference(f"{path}/{prop}", ty1[prop], ty2[prop]))
    return differences

# def compare_enum(e1: dict, e2: dict, path):
#     differences = []
#     for prop in e1.keys() | e2.keys():
#         if prop not in e1:
#             differences.append(Difference(f"{path}/{prop}", None, e2[prop]))
#         elif prop not in e2:
#             differences.append(Difference(f"{path}/{prop}", e1[prop], None))
#         elif e1[prop] != e2[prop]:
#             differences.append(Difference(f"{path}/{prop}", e1[prop], e2[prop]))
#     return differences


def compare_json(data1: dict | int | str | list, data2: dict | int | str | list, path=''):
    differences = []
    if isinstance(data1, dict) and isinstance(data2, dict):
        for key in data1.keys() | data2.keys():
            new_path = f"{path}/{key}" if path else key
            if key not in data1:
                differences.append(Difference(new_path, None, data2[key]))
            elif key not in data2:
                differences.append(Difference(new_path, data1[key], None))
            elif isinstance(data1[key], dict) and isinstance(data2[key], dict):
                differences.extend(compare_json(data1[key], data2[key], new_path))
            elif isinstance(data1[key], list) and isinstance(data2[key], list):
                for i in range(max(len(data1[key]), len(data2[key]))):
                    if i < len(data1[key]) and i < len(data2[key]):
                        differences.extend(compare_json(data1[key][i], data2[key][i], f"{new_path}[{i}]"))
                    elif i < len(data1[key]):
                        differences.append(Difference(f"{new_path}[{i}]", data1[key][i], None))
                    else:
                        differences.append(Difference(f"{new_path}[{i}]", None, data2[key][i]))
                # differences.extend(compare_json(data1[key], data2[key], new_path))
            elif data1[key] != data2[key]:
                differences.append(Difference(new_path, data1[key], data2[key]))
    elif data1 != data2:
        differences.append(Difference(path, data1, data2))
    return differences



def load_json(file_path):
    with open(file_path) as f:
        return json.load(f)

def print_differences(differences: list[Difference]):
    for difference in differences:
        print(f"Path: {difference.path}, \t\t{difference.value1}\t-> \t{difference.value2}")


test1 = {
    'a': 1,
    'b': 2,
    'x': {
        'a': 1,
        'b': 2,
    },
    'y': [1, 2, 3],
    'z': [{'a': 1}, {'b': 2}]
}
test2 = {
    'a': 1,
    'b': 20,
    'x': {
        'a': 10,
        'b': 2,
    },
    'y': [1, 20, 3],
    'z': [{'a': 10}, {'b': 2}]
}


# Example usage
if __name__ == "__main__":
    # differences = compare_versions(test1, test2)
    # print_differences(differences)
    # Load two JSON documents (replace 'file1.json' and 'file2.json' with the actual file paths)
    json1 = load_json('op-20240226.json')
    json2 = load_json('op-2024-03-20.json')

    # Compare the JSON documents
    differences = compare_versions(json1, json2)

    # Print the differences
    print_differences(differences)
