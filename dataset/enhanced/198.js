setcpm(132/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("cr ~ ~ ~").slow(2).gain(.3).room(.4)

$: note("<c2 c2 eb2 g1>*8").s("square").lpf("<400 700 1100 700>").resonance(5).release(.1).gain(.45)

$: s("~ hh ~ hh").gain(.2)
