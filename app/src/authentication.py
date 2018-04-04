from flask import render_template, request, url_for, session, redirect, flash, g
from flask.views import MethodView
from bson.objectid import ObjectId

from .context import build_context
from .database import Database
from .args import args


class AuthenticationHandler(MethodView):
    def get(self, oauth_token):
        next_url = request.args.get('next') or url_for('index')
        if oauth_token is None:
            flash("Authorization failed.")
            return redirect(next_url)

        db = Database.theme_slaughter
        ses = db.sessions.find_one({'github_access_token': oauth_token})
        if ses is None:
            res = db.sessions.insert_one({'github_access_token': oauth_token})
            session['ses_id'] = str(res.inserted_id)
        else:
            session['ses_id'] = str(ses['_id'])

        return redirect(next_url)

def AuthenticationToken(github):
    @github.access_token_getter
    def get_token():
        user = g.user
        if user is not None:
            return user['github_access_token']
        return None

    return get_token

def AuthenticationBefore(app, github):
    @app.before_request
    def do_before():
        g.user = None
        if args.fake_user:
            g.user = {
                '_id': 'FakeUser',
                'username': 'FakeUser'
            }
        elif 'ses_id' in session:
            db = Database.theme_slaughter
            g.user = db.sessions.find_one({'_id': ObjectId(str(session['ses_id']))})
            # TODO: Build user context

            if g.user and 'username' not in g.user:
                g.user['username'] = github.get('/user')['login']
                db.sessions.update_one(
                    {'_id': ObjectId(str(session['ses_id']))},
                    g.user
                )


def Authorize(github):
    class DoAuthorize(MethodView):
        def get(self):
            next_uri = None
            if 'next_uri' in session:
                next_uri = 'http://slaughter.hack-a-game.com/github-callback?next=' + session['next_uri']
            return github.authorize(scope='user', redirect_uri=next_uri)

    return DoAuthorize

def force_login(f):
    def decorator(*args, **kwargs):
        if g.user:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('login', next_uri=str(request.url_rule.rule)[1:]))
    return decorator
