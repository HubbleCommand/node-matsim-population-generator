from xml.dom import minidom
from lxml import etree
import xml.etree.ElementTree as ET
from io import StringIO
import copy
import random

###TODO when update, also put in node thingy

# https://kite.com/python/examples/3486/xml-set-attributes-of-an-xml-element
# https://kite.com/python/examples/3491/xml-add-an-element-as-the-last-child-of-another-xml-element
# https://stackabuse.com/reading-and-writing-xml-files-in-python/

# P1 duplicate 1 plan 1000 times
# Useful for quick testing that reservation System actually affects the routing
def simplePlansGenerator():
    tree = ET.parse("plans.xml")
    root = tree.getroot()
    person = tree.find('person')
    for x in range(2, 1000):
        #Deepcopy is needed, otherwise uses same object I guess
        #And then copies the same ID to all of the people
        #Which would make MATSim throw errors
        #new_person = person
        new_person = copy.deepcopy(person)
        new_person.set('id', str(x))

        root.append(new_person)

    #ET.dump(root)
    tree.write(open('plans1000simple.xml', 'w'), encoding='unicode')

# def complexPlansGenerator():

###TODO when update, also put in node thingy
def randomlyChangeMode(file, chance):
    tree = ET.parse(file)
    root = tree.getroot()

    for person in root:
        if random.random() < chance:
            #plan = child.find('plan')

            #legs = person.find('plan').find('leg')
            #legs.set('mode', 'rcar')

            legs = person.find('plan').findall('leg')
            for leg in legs:
                leg.set('mode', 'rcar')

    tree.write('D:/tmp3/plansCPPwTFCT_25pct_fixed_' + str(chance) + '.xml')


#simplePlansGenerator()

randomlyChangeMode('D:/tmp3/plansCPPwTFCT_25pct_fixed.xml', 0.3)

print("Done")