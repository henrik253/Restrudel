setcpm(116/4)

$: s("bd ~ bd ~ bd ~ bd ~").bank("RolandTR808").gain(.85)

$: s("~ cp ~ cp").gain(.4)

$: s("hh*8").gain(.16)

$: note("a2 eb2 c2 c2").s("sawtooth").lpf(600).release(.2).gain(.4)

$: n("6 7@2 8@2 6@2 4@3 ~").scale("c:minor").s("square").clip(.8).release(.4).lpf(1600).room(.3).gain(.4)
