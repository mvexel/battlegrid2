# Battlegrid Service

This is a simple service to update the value of Battlegrid cells in the PostGIS table that stores them. The only reason this exists is that I couldn't figure out how to do WFS-T from the web application.

## Install

Needed:

* Apache 2.4+
* Apache mod_wsgi (make sure you have the Python 3 version!)
* Python 3.6+

Steps:

* Clone the repo. 
* Create Python virtual environment `python3 -m venv venv`
* Add `activate_this.py` script (the `venv` module [does not include it](https://stackoverflow.com/questions/27462582/how-can-i-activate-a-pyvenv-vitrualenv-from-within-python-activate-this-py-was))
```
cd venv/bin
wget https://raw.githubusercontent.com/pypa/virtualenv/master/virtualenv_embedded/activate_this.py
```
* Set the path to `activate_this.py` in the `wsgi` script.
* Install the application in the virtual environment
```
source venv/bin/activate
python setup.py install
```
* Configure Apache. Here's a sample config you can adapt:
```
<VirtualHost *:80>
    ServerName battlegrid.us

    WSGIDaemonProcess battlegrid2 user=www-data group=www-data threads=5
    WSGIScriptAlias / /home/mvexel/battlegrid2/battlegrid2-flask/battlegrid2.wsgi

    <Directory /home/mvexel/battlegrid2/battlegrid2-flask/>
        WSGIProcessGroup battlegrid2
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
</VirtualHost>
```
* Enable the Apache configuration and reload Apache