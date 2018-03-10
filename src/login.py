from flask import render_template
from flask.views import MethodView

from context import build_context

class Login(MethodView):
    def get(self):
        return render_template('login.html', **build_context())
    
