import ast

def list_imports(filename):
    with open(filename, "r") as file:
        tree = ast.parse(file.read())

    imports = []
    for node in ast.walk(tree):
        # Handles 'import module'
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        # Handles 'from module import name'
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)

    return sorted(list(set(imports)))

# Usages
file_path = 'api_routes.py' # Replace with your file name
print(f"Modules imported in {file_path}:")
print(list_imports(file_path))


# in api_routes.py
# 'Checker', 'IPython.display', 'base64', 'bcrypt', 'diffusers', 'dotenv', 'flask',
#  'flask_restful', 'helper_function', 'io', 'openai', 'os', 'prompts', 'pymongo', 'requests', 'time', 'torch'