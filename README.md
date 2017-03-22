[![Build Status](https://travis-ci.org/KurtWagner/checkee.svg?branch=master)](https://travis-ci.org/KurtWagner/checkee)
[![Coverage Status](https://coveralls.io/repos/github/KurtWagner/checkee/badge.svg?branch=master)](https://coveralls.io/github/KurtWagner/checkee?branch=master)

# Checkee

**Important:** This is an experimental release. Please use at your own risk.

Makes comments on a BitBucket pull request for errors in  given checkstyle files. This process will only comment on additional lines and will remove any comments made by itself in previous runs.

It's optimized for consumption within an existing project but can be used independently. The only configuration file required is a credentials file. See authentication below for more information.

### Installation

To install as part of your project you can use.

#### NPM
```
npm install checkee --save-dev
```

#### Yarn
```
yarn add checkee --dev
```

### Configuration

The simplest way to setup for your project is using a `.checkeerc.json` file. Here you can define the repository details.

```
{
	"bitbucket": {
		"repoSlug": "<REPO SLUG>",
		"repoUser": "<REPO USER>"
	}
}
```

You can now simply call

```
checkee --pull-request 1324 \
        --checkstyle PATH-TO-CHECKSTYLE.xml \
        --credentials PATH-TO-CREDENTIALS.json
```

### Authentication

We only support usernames and passwords. This should be the user you want to be making the comments on the pull requests. It should have read and write access to the pull request and repository. If the user has two-factor authentication enabled, you will need to use an [app password](https://confluence.atlassian.com/bitbucket/app-passwords-828781300.html)<sup>[1](https://blog.bitbucket.org/2016/06/06/app-passwords-bitbucket-cloud/)</sup>.

*To control accessibility and limit scope while not exposing the accounts password you may consider using an app password regardless of 2-factor authentication.*

#### Username/Password

In JSON configuration file somewhere you safely control you can include your credentials.

```
{
	"bitbucket": {
		"username": "<YOUR USERNAME>",
		"password": "<YOUR PASSWORD>"
	}
}
```

At time of execution you consume the credentials file using the `--credentials` option.

Alternatively, you can pass the `--username` and `--password` but be aware that this may appear in your logs. Normally you will start your script with

```
set +x
```

so that commands you run are not echoed to the log.

### Message identifier

The message identifier is used to uniquely identify comments made by the user. Upon update, it will remove any previous comments before making new ones. You should manually set this if you plan to run multiple checkstyle files separately on a single pull request. e.g,

```
checkee --checkstyle perlcritic-checkstyle.xml \
           --message-identifier ".:perl:." \
           --credentials "/credentials.json" \
           --pull-request 1000;

checkee --checkstyle eslint-checkstyle.xml \
           --message-identifier ".:js:." \
           --credentials "/credentials.json" \
           --pull-request 1000;
```	

It defaults to `.:.`.

### Quick Example

The following will make comments on pull request 1324 using errors from `checkstyle-result-1.xml` and `checkstyle-result-2.xml`.

```
checkee \
	--checkstyle checkstyle-result-1.xml \
	--checkstyle checkstyle-result-2.xml \
	--repo-slug my-app \
	--repo-user my-user \
	--pull-request 1324 \
	--credentials "/restricted/bitbucket-credentials.json"
```
