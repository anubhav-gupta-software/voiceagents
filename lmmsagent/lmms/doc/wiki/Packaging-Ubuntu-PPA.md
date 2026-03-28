> **Note:** This is a BZR packaging cheatsheet from a community member.  This wiki (and all wikis in general) are maintained by community members.  If you find this article useful and can improve upon it, please do!

---

### Israel's Cheat Sheet

```bash
WARNING: THIS IS NOT A SCRIPT, THIS IS A CHEAT-SHEET
############################################################################
#                    GET SET UP TO USE BZR && PBUILDER                     #
############################################################################

# Install all the things you need
sudo apt-get install gnupg pbuilder ubuntu-dev-tools bzr-builddeb \
apt-file packaging-dev

# Make your gpg key
gpg --gen-key
# Remember your passphrase!!!!
/* now open up ~/.bashrc
 * gpg --list-keys
 * look at the line from the keyring generateion
 * that starts with sec  2048R/######## 2014-01-04
 * the # part is your GPGkey
 * add the following line, substituting the real
 * key for the #
 */
export GPGKEY=########
# i.e. export GPGKEY=259E7E4E
# Refresh your bash
source ~/.bashrc
# Send the key to ubuntu keyservers
gpg --send-keys --keyserver keyserver.ubuntu.com $GPGKEY
# $GPGKEY Works with the line you entered into .bashrc

# Now for launchpad
# Find your fingerprint with:
#
gpg --fingerprint
https://launchpad.net/~/+editpgpkeys

# You will get an encrypted e-mail, save the text from:
# -----BEGIN PGP MESSAGE-----
# to
# -----END PGP MESSAGE-----
# as a txt file (in this example gpg.txt)
# now run:

gpg --decrypt gpg.txt
# and go to the link.... you are done!!
# Note:  Thunderbird has an extension to decrypt e-mail


# Make your ssh key
ssh-keygen -t rsa
# Choose default filename, enter a password 2x
# Open the file (pico doesn't copy the comment on the end)... so use 
# gedit (maybe others)
gedit ~/.ssh/id_rsa.pub
goto  https://launchpad.net/~/+editsshkeys

# Configure bzr
# bzr whoami "Name <email@host.org>
bzr whoami "John Doe <jdoe@lmms.io>"
# bzr launchpad-login lpname
bzr launchpad-login jdoe

# Configure BASH
gedit ~/.bashrc
# Add these lines
# export DEBFULLNAME="Name Comment(optional)"
export DEBFULLNAME="John Doe"
# export DEBEMAIL="email@host.org"
export DEBEMAIL="jdoe@lmms.io"
# Restart bash
source ~/.bashrc

# pbuilder-dist <release> create VERY IMPORTANT!!!!!!!!!!!!!!!!
# This makes the chroot environment for whatever release you need
pbuilder-dist trusty create

############################################################################
#                          PACKAGE BUILDING                                #
############################################################################

# To start your branch, cd into the directory you want to be in to do your 
# work i.e. cd ~/programming/bzr
# bzr branch ubuntu:<dist>/<package> <new_directory_name>
# bzr branch lp:ubuntu/lmms is the most current version
# bzr branch lp:<packagename> works with code hosted on launchpad
# i.e. bzr branch lp:tardis
bzr branch ubuntu:utopic/lmms lmms

############################################################################
#                  TO MERGE WITH EXISTING SOURCE PACKAGE                   #
#                 (with --version &number &locationOftar                   #
############################################################################

bzr merge-upstream  ../relativePath/to/program.tar.gz
# OR, if the watch file is done right
bzr merge-upstream
# This will automatically download and merge the upstream based on what is
# in the watch file.

# Then, edit the debian/changelog & commit your changes with:
bzr commit

############################################################################
#                               TO TEST YOUR FIX                           #
############################################################################

# This command is one I have needed occasionally... but it isn't as good as 
# below
# bzr builddeb -S --package-merge

# Run this and THEN pbuilder each time you change something to test the fix
bzr builddeb -- -S -us -uc
# cd .. out of the BASE directory to where the dsc file is
# pbuilder-dist <dist> build <package>_<version#>-<ubuntu revision#>.dsc
pbuilder-dist trusty build lmms_1.0.2-0ubuntu1.dsc 
# if using bzr merge-upstream lp:lmms

# cd ~/pbuilder/<dist>_result/
cd ~/pbuilder/trusty_result/
# Remove any currently installed versions and install newly built version
# be sure to remove any old deb files you may have used... Though the newer
# version will be the only installed one... Sometimes it can cause problems
sudo apt-get autoremove lmms && sudo dpkg -i lmms*.deb

############################################################################
#                         COMMITTING THE PACKAGE                           #
############################################################################

# TO EDIT CHANGELOG
dch -i
# Though, personally I like to use a text editor and simply manually edit it.
# i.e. gedit/geany/mousepad/etc...

bzr commit

############################################################################
#                      PUSHING THE CHANGE TO LAUNCHPAD                     #
############################################################################

# bzr push lp:/~<user>/ubuntu/<dist>/<package>/<specific package with ver #>
bzr push lp:/~israeldahl/ubuntu/trusty/lmms/lmms_1.1.0
# If you are hosting your code on lp it is different
# bzr push lp:<project-name>
bzr push lp:tardis
# ... or for a sub branch
bzr push lp:tardis/testing

############################################################################
#                             HELPFUL COMMANDS                             #
############################################################################

# shows status of your branch (i.e. CURRENT)
bzr status

# Adding *ANY* file into the /debian directory
bzr add

# Make a launchpad repo
# This is a command I don't use often.. it makes the +junk branch (IIRC)
bzr init-repo trusty_lmms

# This proposes it for a merger, which is only useful if you are fixing 
# up an existing program
bzr lp-propose


# This is just so I can copy and paste it as the rules file
# tiny dh rules file
#!/usr/bin/make -f
%:
	dh $@
```