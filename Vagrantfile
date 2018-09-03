# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/artful64"
  config.vm.hostname = File.basename(Dir.getwd).downcase

  # Port forwarding for Browsersync, Browsersync UI, and Weinre respectively.
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "forwarded_port", guest: 3001, host: 3001
  config.vm.network "forwarded_port", guest: 3002, host: 3002

  # Port forwarding for the web server.
  config.vm.network "forwarded_port", guest: 80, host: 8080

  # https://plus.google.com/+AaronBushnell/posts/c3G7SpRWh3U
    :owner => 'www-data',
    :group => 'www-data',
    :mount_options => ['dmode=777,fmode=777']

  config.vm.synced_folder "www/imager", "/vagrant/www/imager",
  config.vm.synced_folder "storage", "/vagrant/storage",
    :owner => 'www-data',
    :group => 'www-data',
    :mount_options => ['dmode=777,fmode=777']

  # The default 1 gigabyte of memory is not enough to run UglifyJS.
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
  end

  config.vm.provision "shell", path: "provisioning/bootstrap.sh"
end
