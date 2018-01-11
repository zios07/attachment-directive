# Introduction

The purpose of this document is to explain the utility, integration and the use of the omni-attachment directive.

# Using the attachment directive

## Integrating the directive in the application

To integrate the directive in your angularJS application, you just have to import it in your application by adding the following line in your bower.json :

```json
"omniAttachment": "http://10.10.1.170:10080/os-angularjs/omni-attachement.git",
...
```

You can then put the directive in anywhere of your html page by using the ```<omni-attachment></omni-attachment>``` html tag.

## Directive attributes

This directive contain 4 attributes which provide the ability to customization all the operations offered by the directive (upload, download, delete and consultation).
- id : The id of the entity to whom belongs the attachment
- class-name : The complete name of the entity class
- application-name : the name of the application
- mode : write/read
  - read : offers the possibility to view and download attachments.
  - write : gives access to upload (size < 17MB) and delete attachments functionalities, in addition to what read mode offers. 

## The directive's rendering

The directive's rendering will appear as follows:

#### Read mode

![Figure 1](images/read_mode.png "Figure 1")

You can click on the 'download' icon to download the file or preview it on your browser in case of PDF files.

#### Read mode

![Figure 2](images/write_mode.png "Figure 2")

Here you have the possibility to upload, download and delete attachments.

NB: You should specify a name for your file before uploading it.

## Directive's features

#### Auto-localization

The omni-attachment directive relies on the famous pascal precht translate directive to localize its output text. It sets automatically the language to use by looking at your browser preferences, settings ... 

NB: Currently, the directive supports only english and french.

#### Controlling the directive's appearance

A bunch of css classes are available to give you total control of the appearance of all the components of the directive.
The following schema shows you which css class controls which part of the directive's rendering.

+ *attachment-container* : controls the style of the whole container div of the directive

+ *attachment-success-message* : controls the style of the success message shown after a successful operation

  ![Figure 3](images/success_msg.png "Figure 3")

+ *attachment-error-message* : controls the style of the error message shown after a failure.

  ![Figure 4](images/error_msg.png "Figure 4")

+ *attachment-progressbar* : controls the style of the progress bar shown while uploading a file.

  ![Figure 5](images/progressbar.png "Figure 5")

+ Other components:

  ![Figure 6](images/schema.png "Figure 6")