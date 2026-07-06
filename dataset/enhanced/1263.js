setcpm(120/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("hh*8").gain(.18)

$: note("a#5 g#5 c#4 e4 a#4 g#4 e4 c#4").s("sawtooth").lpf(929).resonance(8).release(.2).delay(.4).gain(.35)

$: note("<c#2 c#2 g#1 a#1>").s("square").lpf(650).release(.25).gain(.5)
