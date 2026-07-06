setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.15)

$: n("-3 -2 0 -2").sound("rim").bank("RolandTR909").lpf(2000).room(.4).gain("[.8 .5]*4")

$: n("0 -2 -4 -2").scale("c:minor").s("sawtooth").lpf(600).release(.2).gain(.4)

$: n("7 5 3 5").scale("c:minor").s("square").lpf(1500).release(.2).room(.3).gain(.35)
