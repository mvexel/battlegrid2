# Battlegrid 2 Web Application

## Requirements

* node
* `libapache2-mod-passenger`

## Setup

* get dependencies `npm install`
* build site `npm run build`
* configure Apache, here's a sample:

```
<VirtualHost *:80>
    ServerName battlegrid.us

    DocumentRoot /home/mvexel/battlegrid2/battlegrid2-web/dist
    PassengerAppRoot /

    PassengerAppType node
    PassengerStartupFile index.js

    <Directory /home/mvexel/battlegrid2/battlegrid2-web/dist/>
      Allow from all
      Options -MultiViews
      Require all granted
    </Directory>
</VirtualHost>
```	

* Enable site and reload apache `a2ensite battlegrid-web.conf && service apache2 reload`