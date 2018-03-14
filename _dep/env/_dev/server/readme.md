## create the .conf file and place it into the directory apache will search for
sudo ln -s /var/www/git/More/view-loader/test/env/_dev/server/apache.conf /etc/apache2/sites-available/view-loader.conf &&
sudo ln -s /etc/apache2/sites-available/view-loader.conf /etc/apache2/sites-enabled/view-loader.conf 
sudo service apache2 restart
