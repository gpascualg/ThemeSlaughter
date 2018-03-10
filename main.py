from flask import Flask
from flask_github import GitHub
from flask_session import Session

from src.database import session, db
from src.propose import Propose
from src.vote import Vote
from src.login import Login

from src.authentication import AuthenticationHandler, AuthenticationToken, AuthenticationBefore, force_login


class App(object):
    def __init__(self, name=__name__):
        app = Flask(name)

        # Github config
        app.config['SECRET_KEY'] = 'poeopkqwe21093u102ewiWQ*Eoqpw'
        app.config['GITHUB_CLIENT_ID'] = '9ff841f5eb302de30531'
        app.config['GITHUB_CLIENT_SECRET'] = '9916474c4b499923a415750169d6da2708030c82'
        self.github = GitHub(app)

        # Server side sessions
        app.config['SESSION_TYPE'] = 'mongodb'
        app.config['SESSION_MONGODB'] = session
        Session(app)

        # Create rules
        app.add_url_rule('/propose', view_func=force_login(Propose.as_view('propose')))
        app.add_url_rule('/vote', view_func=Vote.as_view('vote'))
        app.add_url_rule('/login', view_func=Login.as_view('login'))

        # Github login related rules
        app.add_url_rule(
            '/github-callback/<oauth_token>', 
            view_func=self.github.authorized_handler(AuthenticationHandler.as_view('github-callback'))
        )
        AuthenticationToken(self.github)
        AuthenticationBefore(app)
        
        self.app = app

    def start(self, *args, **kwargs):
        self.app.run(*args, **kwargs)

def main():
    app = App()
    app.start(debug=True)

main()
