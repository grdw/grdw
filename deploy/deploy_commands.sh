echo "> Starting deploy"
cd /www/
rm -rf grdw
echo "> Removed old project"

git clone https://github.com/grdw/grdw.git

cache-purge http://grdw.nl
echo "> Finished"
