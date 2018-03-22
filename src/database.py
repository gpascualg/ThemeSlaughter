from pymongo import MongoClient, ASCENDING

class DatabaseType(type):
    def __getattribute__(cls, key):
        if key in ('connect', 'session'):
            return object.__getattribute__(cls, key)
        return cls.session[key]

class Database(metaclass=DatabaseType):
    session = None

    def connect(host=None):
        if Database.session is None:
            Database.session = MongoClient(host=host, serverSelectionTimeoutMS=1)
            Database.session.server_info() # Force connection

        return Database.session
