#!/usr/bin/python3

activate_this = '/home/mvexel/battlegrid2/battlegrid2-flask/venv/bin/activate_this.py'
with open(activate_this) as file_:
        exec(file_.read(), dict(__file__=activate_this))

        from battlegrid2 import create_app
        application = create_app()


