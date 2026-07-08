setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("rd*3 ~ woodblock:1 ~").gain(.35)

$: s("~ sd").gain(.5)

$: n("0 2 3 5").scale("a:minor").s("supersaw").lpf(1200).release(.2).gain(.4)
