import os
from shutil import copyfile

# Create main project directory
project_name = "salvus-sequr"
os.makedirs(project_name, exist_ok=True)
os.chdir(project_name)

# Create frontend directory using create-react-app
os.system("npx create-react-app frontend")

# Create backend directory and app.py file
os.makedirs("backend", exist_ok=True)
backend_code = """from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message='Hello from the backend!')

if __name__ == '__main__':
    app.run(port=5000)
"""
with open("backend/app.py", "w") as f:
    f.write(backend_code)

# Create a .gitignore file for both frontend and backend
gitignore_content = "/node_modules/\n/build/\n__pycache__/\n*.pyc\n*.pyo\n*.pyd\n*.db\n"
with open(".gitignore", "w") as f:
    f.write(gitignore_content)
with open("frontend/.gitignore", "w") as f:
    f.write("/build/\n")

# Copy the frontend's .gitignore to the main project directory
copyfile("frontend/.gitignore", ".gitignore")

print("Project structure created successfully.")
