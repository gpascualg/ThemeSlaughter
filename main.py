from flask import Flask

from propose import Propose


class App(object):
    def __init__(self, name=__name__):
        self.app = Flask(name)
        self.app.add_url_rule('/propose', view_func=Propose.as_view('propose'))

    def start(self, *args, **kwargs):
        self.app.run(*args, **kwargs)

def main():
    app = App()
    app.start(debug=True)

main()
