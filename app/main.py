import os

from flask import Flask
from flask_github import GitHub
from flask_session import Session

from src.args import args
from src.database import Database
from src.index import Index
from src.propose import Propose
from src.vote import Vote
from src.login import Login

from src.authentication import AuthenticationHandler, AuthenticationToken, AuthenticationBefore, Authorize


class App(object):
    def __init__(self, name=__name__):
        # Host from parameters
        Database.connect(host=args.mongo_host)

        # App
        app = Flask(name)

        # Github config
        app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
        app.config['GITHUB_CLIENT_ID'] = os.environ['GITHUB_CLIENT_ID']
        app.config['GITHUB_CLIENT_SECRET'] = os.environ['GITHUB_CLIENT_SECRET']
        self.github = GitHub(app)

        # Server side sessions
        app.config['SESSION_TYPE'] = 'mongodb'
        app.config['SESSION_MONGODB'] = Database.session
        Session(app)

        # Create rules
        app.add_url_rule('/', view_func=Index.as_view('index'))
        app.add_url_rule('/propose', view_func=Propose.as_view('propose'))
        app.add_url_rule('/vote', view_func=Vote.as_view('vote'))
        app.add_url_rule('/login/<next_uri>', view_func=Login.as_view('login'))
        app.add_url_rule('/do-login', view_func=Authorize(self.github).as_view('do-login'))

        # Github login related rules
        app.add_url_rule(
            '/github-callback', 
            view_func=self.github.authorized_handler(AuthenticationHandler.as_view('github-callback'))
        )
        AuthenticationToken(self.github)
        AuthenticationBefore(app)
        
        self.app = app

    def run(self, *args, **kwargs):
        self.app.run(*args, **kwargs)

def main():
    app = App()
    app.run(host='0.0.0.0', debug=args.debug)

if __name__ == '__main__':
    main()
