### 0.0.5

*Fixes:*

- Some checkstyles were missing "source" attribute on errors. This change gracefully ignores the source if one is not given (fixes #6)

### 0.0.4

*Fixes:*

- Missing comments on unchanged files. These files were appearing in the activity of bitbucket but not on the actual files. See discussion [here](https://bitbucket.org/site/master/issues/13110/post-comment-on-a-commit-pull-request-api) (fixes #3)

### 0.0.3

*Fixes:*

- Retry HTTP requests on "Too Many Requests" (fixes #2)

### 0.0.2

*Features:*

- new arguments --username and --password instead of --credentials
- new arguments --message-identifier can now be used to set the unique identifier for comments. This should be used when you have multiple runs on a single pull request.

### 0.0.1

- Initial experimental release.