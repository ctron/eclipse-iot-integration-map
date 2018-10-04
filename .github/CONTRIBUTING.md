# Contributing to the Eclipse IoT Integration Map

Thank you for contributing to the [Eclipse IoT](https://iot.eclipse.org) integration map.

## Do you want to add a project to the map?

If you want an Eclipse IoT project to be added to the map:

* It has to be an Eclipse IoT project.
* You will need to make a decision if you want to be listed as "Library" or "Application" project
* Create a PR, making the necessary changes to add yourself to the map. Do not damage any other projects in the process.

### Library Project / Building block

A library project is a building block for "application projects". It is only useful in the
context of an application project.

Additional requirements are:

* The project has to be used at least by one Eclipse IoT application project on the map.

For example: Eclipse Paho is an MQTT client library. By itself it isn't useful. It is being used by 
the IoT gateway Eclipse Kura in order to implement MQTT connectivity. Eclipse Kura is integrated with
Eclipse Kapua, which are both on the map.

### Application Project

An application project is a project who's main purpose is to run by itself. It may only be
useful in a greater context, but it doesn't need to be embedded into some other application.

Additional requirements are:

* The project has to integrate at least with one project on the map. Adding two new projects at the same
  time is fine if they are integrated with each other.
* There has to be at least one publicly available blog post, article, or documentation that can be
  linked to, which describes how to integrate the two projects.

For example: Eclipse Ditto is an application project, as it can be run directly. It integrates with
Eclipse Hono, and provides some documentation on how to achieve that.

## Did you find a bug?

Yes, there are plenty. Pick one, and make the world a better place :wink:

* Please open a new GitHub issue, if none already exists.
* If you would like to fix the issue yourself, please say so and start a discussion on how you would like to fix the issue.
* Create a PR, referencing the issue and describing your changes.
