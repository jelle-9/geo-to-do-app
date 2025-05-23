from . import db

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, DateTime, func, Float
from geoalchemy2 import Geometry
from datetime import datetime

class Task(db.Model):
    """
    Datenbankmodell für Aufgaben.
    """
    __tablename__ = 'tasks'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_done: Mapped[bool] = mapped_column(default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # TODO: Geo-Daten hinzufügen
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Das PostGIS Geometrie-Feld
    # Speichert den Standort als Punkt-Geometrie.
    # srid=4326: WGS84 Koordinatensystem (Standard für GPS lat/lon).
    # spatial_index=True: Erstellt einen räumlichen Index für schnelle Geo-Abfragen.
    geom: Mapped[Geometry | None] = mapped_column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=True)
    
    def __repr__(self):
        return f"<Task {self.id}: {self.title}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'is_done': self.is_done,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'latitude': self.latitude,
            'longitude': self.longitude
        }