from flask import render_template, session, abort
from flask.views import MethodView

from .context import build_context

class Login(MethodView):
    def get(self, next_uri):
        if next_uri not in ('vote', 'propose'):
            return abort(400)

        session['next_uri'] = next_uri
        return render_template('login.html', **build_context())
    
