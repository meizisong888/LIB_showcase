#!/usr/bin/env python3
"""Recreate exact evidence crops; no enhancement, retouching or generative step."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
CROPS=[('01',(70,170,890,520),'01-detail'),
       ('03',(830,1110,1680,1360),'03-arago-detail'),
       ('03',(100,530,840,720),'03-name-detail'),
       ('02',(80,1540,900,1640),'02-address-detail')]
for sid,box,name in CROPS:
    with Image.open(ROOT/'images'/f'{sid}.jpg') as image:
        image.crop(box).save(ROOT/'images'/f'{name}.jpg',quality=95)
    print(name,box)
