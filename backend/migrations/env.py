# backend/migrations/env.py
import logging
from logging.config import fileConfig

from flask import current_app

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')


# <<< ANFANG DER ANPASSUNG FÜR include_object >>>
def include_object(object, name, type_, reflected, compare_to):
    """
    Entscheidet, ob ein Objekt in den Autogenerate-Prozess einbezogen wird.
    Wir wollen verhindern, dass Tabellen gelöscht werden, die in der DB existieren,
    aber nicht Teil unserer SQLAlchemy-Modelle sind (z.B. PostGIS-Systemtabellen).
    """
    if type_ == "table" and reflected and compare_to is None:
        # Dieses Objekt ist eine Tabelle, existiert in der Datenbank (reflected=True),
        # aber nicht in unseren Modellen (compare_to is None).
        # Wir wollen solche Tabellen ignorieren, um DROP-Operationen zu verhindern.
        logger.info(
            f"Ignoring table not in models (type='{type_}', name='{name}', "
            f"reflected={reflected}, compare_to={compare_to})"
        )
        return False  # Nicht einbeziehen, also keine DROP-Anweisung generieren

    # Für alle anderen Fälle (z.B. Tabellen, die in unseren Modellen sind,
    # oder andere Objekttypen wie Indizes auf unseren Tabellen)
    # soll Alembic normal verfahren.
    return True
# <<< ENDE DER ANPASSUNG FÜR include_object >>>


def get_engine():
    try:
        return current_app.extensions['migrate'].db.get_engine()
    except (TypeError, AttributeError):
        return current_app.extensions['migrate'].db.engine


def get_engine_url():
    try:
        return get_engine().url.render_as_string(hide_password=False).replace(
            '%', '%%')
    except AttributeError:
        return str(get_engine().url).replace('%', '%%')


config.set_main_option('sqlalchemy.url', get_engine_url())
target_db = current_app.extensions['migrate'].db


def get_metadata():
    if hasattr(target_db, 'metadatas'):
        return target_db.metadatas[None]
    return target_db.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=get_metadata(),
        literal_binds=True,
        # <<< ANPASSUNG HIER >>>
        include_object=include_object,
        compare_type=True # Wichtig, um auch Spaltentyp-Änderungen zu erkennen
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    def process_revision_directives(context, revision, directives):
        if getattr(config.cmd_opts, 'autogenerate', False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info('No changes in schema detected.')

    conf_args = current_app.extensions['migrate'].configure_args
    if conf_args.get("process_revision_directives") is None:
        conf_args["process_revision_directives"] = process_revision_directives

    # <<< ANPASSUNG HIER >>>
    # Stelle sicher, dass include_object und compare_type in conf_args sind
    conf_args['include_object'] = include_object
    conf_args['compare_type'] = True # Wichtig, um auch Spaltentyp-Änderungen zu erkennen

    connectable = get_engine()

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=get_metadata(), # Dies sind deine db.Model.metadata
            **conf_args # include_object und compare_type werden hierüber übergeben
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()