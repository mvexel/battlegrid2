# pylint: disable=C0103,C0111,E0401,E1101,R0902,W0612

import os
import psycopg2
from flask import Flask, jsonify, abort, request, make_response

DB_NAME = 'osm'
DB_USER = 'osm'
DB_BATTLEGRID_TABLE = 'battlegrid'

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # define database connection
    db_connection = psycopg2.connect('dbname={} user={}'.format(DB_NAME, DB_USER))
    db_cursor = db_connection.cursor()

    # endpoint to get a cell's details
    @app.route('/cell/<cell_id>', methods=['GET'])
    def get_cell(cell_id):
        db_cursor.execute(
            'select "quality" from {} where id = %s'.format(
                DB_BATTLEGRID_TABLE),
            (cell_id,))
        if db_cursor.rowcount == 0:
            abort(404)
        record = db_cursor.fetchone()
        return jsonify({'quality': record[0]})

    # endpoint to update a cell's details
    @app.route('/cell/<cell_id>', methods=['POST'])
    def update_cell(cell_id):
        cell_quality = request.form.get('quality')
        try:
            db_cursor.execute(
                'update {} set quality = %s where id = %s'.format(
                    DB_BATTLEGRID_TABLE),
                (cell_quality, cell_id))
        except psycopg2.Error as error:
            print(error.message)
            abort(500)
        return make_response(jsonify({'result':'success'}), 200)
    return app
