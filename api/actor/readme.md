# @-/actor

An actor is how Tunnel handles authorization throughout the application. You can think of an actor as an "authorized entity." Different endpoints might require different types of authorization; for example, an "update profile" endpoint needs the end user to authorize themselves as a certain Tunnel user, while an "accept invitation" endpoint needs the end user to authorize themselves as the intended recipient of the invitation.
