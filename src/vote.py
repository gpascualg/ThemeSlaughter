from flask import render_template
from flask.views import MethodView

from context import build_context

class Vote(MethodView):
    def get(self):
        return render_template('vote.html', **build_context())
    
