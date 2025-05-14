from flask import Blueprint, request, jsonify
from ..models import Task
from .. import db

tasks_bp = Blueprint('tasks', __name__)

# Route zum Erstellen einer neuen Aufgabe
# Erreichbar unter POST /api/tasks (da /api in __init__.py als Präfix für diesen Blueprint gesetzt wird)
@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    """
    Erstelle eine neue Aufgabe.
    """
    data = request.get_json()

    new_task = Task(
        title=data.get('title'),
        description=data.get('description')
    )

    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201 # 201 CREATED

# Route zum Abrufen aller Aufgaben
# Erreichbar unter GET /api/tasks
@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """
    Hole alle Aufgaben.
    """
    all_tasks = Task.query.order_by(Task.created_at.desc()).all() # Neueste zuerst
    
    return jsonify(tasks=[task.to_dict() for task in all_tasks])

# Route zum Abrufen einer einzelnen Aufgabe anhand ihrer ID
# Erreichbar unter GET /api/tasks/<task_id>
@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """
    Hole eine Aufgabe anhand ihrer ID.
    """
    task = Task.query.get_or_404(task_id)
    
    return jsonify(task.to_dict())

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """
    Aktualisiere eine Aufgabe anhand ihrer ID.
    """
    task = Task.query.get_or_404(task_id)
    data = request.get_json()

    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'is_done' in data:
        task.is_done = data['is_done']


    db.session.commit()   
    return jsonify(task.to_dict())

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify(message="Task deleted successfully"), 200 # Oder 204 No Content