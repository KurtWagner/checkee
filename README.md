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
yarn add checkee
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

We only support username/password at this point. This should be the user you want to be making the comments on the pull requests. It should have read and write access to the pull request.

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
