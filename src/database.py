from pymongo import MongoClient, ASCENDING


class Database(object):
    session = None

    @staticmethod
    def connect(host=None):
        if Database.session is None:
            Database.session = MongoClient(host=host, serverSelectionTimeoutMS=1)
            Database.session.server_info() # Force connection

        return Database.session

    @staticmethod
    def get(collection):
        Database.connect()
        return Database.session[collection]


