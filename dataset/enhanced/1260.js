setcpm(124/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").room(.4).delay(.3).gain("<0.85 0.7 0.6 0.75>")

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: s("hh*8").gain(.18)

$: note("g#4 ~ f#4 f#4 ~ f4 f4 ~").s("sawtooth").lpf(2400).resonance(6).release(.25).delay(.4).room(.3).gain(.35)

$: note("<c#2 c#2 f#1 f1>").s("square").lpf(650).release(.25).gain(.5)
