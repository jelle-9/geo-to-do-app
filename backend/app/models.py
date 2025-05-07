from . import db

class Task(db.Model):
    """
    Datenbankmodell für Aufgaben.
    """
    __tablename__ = 'tasks'