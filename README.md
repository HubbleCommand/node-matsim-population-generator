# node-matsim-population-generator

Very simple "CLI" that generates a MATSim population with the data under ./data.

Generates population for the Grand Genève.

# Using Python

Small bit of python code that allows you to take one of the outputs of the Node part, and then change the % of people using modes.

# Using Node

If you want to quickly use it from the command line, navigate a terminal into the directory with the package.json, and execture:

````
npm link
```

Which will link all the scripts in "bin", and allow you to run them from anywhere on your computer!

The only command so far is generate-pop.

To use `generate-pop`, navigate to the directory you want the results to be written to.

A file named plans.xml will apear once the command has finished running.
