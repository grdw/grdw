echo "> Starting deploy"
cd /www/
rm -rf grdw
echo "> Removed old project"
git clone https://github.com/grdw/grdw.git

echo "> Removing deploy files"
rm -rf grdw/deploy/
rm grdw/README.md

echo "> Moving html files to root"
mv grdw/* .
rm -rf grdw

cache-purge http://grdw.nl
echo "> Finished"
